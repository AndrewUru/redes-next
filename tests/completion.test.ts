import { describe, expect, it } from "vitest";
import { calculateCompletionPct } from "@/lib/intake/completion";

describe("calculateCompletionPct", () => {
  it("returns percentage by completed steps", () => {
    const pct = calculateCompletionPct({
      identity: { brandName: "Acme", tagline: "", mission: "Mision" },
      goals: { businessGoals: ["x"], shortTermGoals: "" }
    } as never);
    expect(pct).toBe(20);
  });
});
