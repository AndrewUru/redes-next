import { describe, expect, it } from "vitest";
import { intakeSchema } from "@/lib/intake/schema";

describe("intakeSchema", () => {
  it("validates a complete payload", () => {
    const payload = {
      identity: { brandName: "Acme", tagline: "Hola", mission: "Crecer en redes" },
      goals: { businessGoals: ["leads"], shortTermGoals: "20 piezas" },
      audience: { primaryAudience: "B2B", painPoints: ["falta de tiempo"] },
      tone: { voiceAttributes: ["cercano"], forbiddenWords: ["barato"] },
      pillars: { contentPillars: ["educativo"] },
      messaging: { coreMessage: "Somos expertos", differentiators: ["rapidez"] },
      ctas: { primaryCTA: "Agenda llamada", secondaryCTA: "Descarga guia" },
      visual: {
        colorPreferences: ["azul"],
        visualDo: ["fotos reales"],
        visualDont: ["stock generico"]
      },
      references: { competitors: ["Competidor X"], inspirationLinks: ["https://example.com"] },
      logistics: { approvalsFlow: "email", postingFrequency: "3/semana" }
    };

    const result = intakeSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });
});
