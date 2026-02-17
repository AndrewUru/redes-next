import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);

export const intakeSchema = z.object({
  identity: z.object({
    brandName: nonEmptyString,
    tagline: z.string().optional().default(""),
    mission: nonEmptyString
  }),
  goals: z.object({
    businessGoals: z.array(nonEmptyString).min(1),
    shortTermGoals: z.string().optional().default("")
  }),
  audience: z.object({
    primaryAudience: nonEmptyString,
    painPoints: z.array(nonEmptyString).min(1)
  }),
  tone: z.object({
    voiceAttributes: z.array(nonEmptyString).min(1),
    forbiddenWords: z.array(nonEmptyString).default([])
  }),
  pillars: z.object({
    contentPillars: z.array(nonEmptyString).min(1)
  }),
  messaging: z.object({
    coreMessage: nonEmptyString,
    differentiators: z.array(nonEmptyString).min(1)
  }),
  ctas: z.object({
    primaryCTA: nonEmptyString,
    secondaryCTA: z.string().optional().default("")
  }),
  visual: z.object({
    colorPreferences: z.array(nonEmptyString).min(1),
    visualDo: z.array(nonEmptyString).min(1),
    visualDont: z.array(nonEmptyString).default([])
  }),
  references: z.object({
    competitors: z.array(nonEmptyString).default([]),
    inspirationLinks: z.array(z.string().url()).default([])
  }),
  logistics: z.object({
    approvalsFlow: nonEmptyString,
    postingFrequency: nonEmptyString
  })
});

export type IntakeData = z.infer<typeof intakeSchema>;
export type IntakeStepKey = keyof IntakeData;

export const intakeStepOrder: IntakeStepKey[] = [
  "identity",
  "goals",
  "audience",
  "tone",
  "pillars",
  "messaging",
  "ctas",
  "visual",
  "references",
  "logistics"
];

export const intakeStepSchemas: Record<IntakeStepKey, z.ZodTypeAny> = {
  identity: intakeSchema.shape.identity,
  goals: intakeSchema.shape.goals,
  audience: intakeSchema.shape.audience,
  tone: intakeSchema.shape.tone,
  pillars: intakeSchema.shape.pillars,
  messaging: intakeSchema.shape.messaging,
  ctas: intakeSchema.shape.ctas,
  visual: intakeSchema.shape.visual,
  references: intakeSchema.shape.references,
  logistics: intakeSchema.shape.logistics
};
