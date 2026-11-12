import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), ai: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/ai/openai", () => ({
  aiModel: "test",
  getOpenAIClient: mocks.ai
}));
import { GET, PATCH, POST } from "@/app/api/client/content-plans/route";

const content = {
  rationale: "Una prueba editorial",
  items: [
    {
      day: 0,
      format: "reel",
      title: "Tema",
      objective: "Objetivo",
      hook: "Gancho",
      script: "Guion",
      caption: "Copy",
      materials: "Vídeo"
    }
  ]
};
function request(payload: unknown) {
  return new Request("http://localhost/api/client/content-plans", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
function database(
  user: unknown = { id: "user-a" },
  membership: unknown = { client_id: "client-a" },
  result: unknown = { id: "plan-a" }
) {
  const plans = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: result, error: null })
  };
  const link = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: membership, error: null })
  };
  const db = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn((table) => (table === "client_users" ? link : plans))
  };
  mocks.createClient.mockResolvedValue(db);
  return { db, plans };
}

beforeEach(() => vi.clearAllMocks());
describe("Content plan API authorization and concurrency", () => {
  it("rejects unauthenticated reads before accessing tables", async () => {
    const { db } = database(null);
    expect((await GET())?.status).toBe(401);
    expect(db.from).not.toHaveBeenCalled();
  });
  it("rejects users without a client membership", async () => {
    database({ id: "user-a" }, null);
    expect((await POST(request({ week: "2026-11-16" })))?.status).toBe(403);
    expect(mocks.ai).not.toHaveBeenCalled();
  });
  it("does not charge an AI call for a duplicate week", async () => {
    database();
    expect((await POST(request({ week: "2026-11-16" })))?.status).toBe(409);
    expect(mocks.ai).not.toHaveBeenCalled();
  });
  it("scopes writes to session membership and expected revision", async () => {
    const { plans } = database();
    const response = await PATCH(
      request({
        id: "00000000-0000-4000-8000-000000000000",
        client_id: "client-b",
        revision: 2,
        status: "approved",
        content
      })
    );
    expect(response?.status).toBe(200);
    expect(plans.eq).toHaveBeenCalledWith("client_id", "client-a");
    expect(plans.eq).toHaveBeenCalledWith("revision", 2);
    expect(plans.update).toHaveBeenCalledWith({
      content,
      status: "approved",
      revision: 3
    });
  });
  it("reports a conflict when the scoped revision matches no row", async () => {
    database({ id: "user-a" }, { client_id: "client-a" }, null);
    expect(
      (
        await PATCH(
          request({
            id: "00000000-0000-4000-8000-000000000000",
            revision: 1,
            status: "draft",
            content
          })
        )
      )?.status
    ).toBe(409);
  });
  it("rejects malformed JSON", async () => {
    database();
    const response = await POST(
      new Request("http://localhost", { method: "POST", body: "{" })
    );
    expect(response?.status).toBe(400);
    expect(mocks.ai).not.toHaveBeenCalled();
  });
});
