import { describe, expect, it } from "vitest";
import {
  currentMonday,
  createPlanSchema,
  planSchema,
  reviewPlanSchema,
  weekSchema
} from "@/lib/content/schema";

describe("Editorial plan boundaries", () => {
  it("accepts Mondays, rejects invalid and non-Monday dates", () => {
    expect(weekSchema.safeParse("2026-11-16").success).toBe(true);
    for (const value of ["2026-11-17", "2026-02-30", "bad-date"]) {
      expect(weekSchema.safeParse(value).success).toBe(false);
    }
  });
  it("uses Madrid's Monday at a Sunday UTC boundary", () => {
    expect(currentMonday(new Date("2026-11-15T23:30:00Z"))).toBe("2026-11-16");
    expect(currentMonday(new Date("2026-07-05T22:30:00Z"))).toBe("2026-07-06");
  });
  it("bounds generation costs and refuses unsupported publishing states", () => {
    expect(
      createPlanSchema.safeParse({ week: "2026-11-16", count: 100 }).success
    ).toBe(false);
    expect(
      reviewPlanSchema.safeParse({
        id: "00000000-0000-4000-8000-000000000000",
        revision: 1,
        status: "published",
        content: {}
      }).success
    ).toBe(false);
  });
  it("rejects empty plans and out-of-week pieces", () => {
    expect(
      planSchema.safeParse({ rationale: "Prueba", items: [] }).success
    ).toBe(false);
    const item = {
      day: 7,
      format: "reel",
      title: "Tema",
      objective: "Objetivo",
      hook: "Gancho",
      script: "Guion",
      caption: "Copy",
      materials: "Vídeo"
    };
    expect(
      planSchema.safeParse({ rationale: "Prueba", items: [item] }).success
    ).toBe(false);
    expect(
      planSchema.safeParse({
        rationale: "Prueba",
        items: [{ ...item, day: 0 }]
      }).success
    ).toBe(true);
  });
});
