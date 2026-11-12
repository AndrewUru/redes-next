import { z } from "zod";

export const weekSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      date.getUTCDay() === 1
    );
  }, "Selecciona el lunes de la semana.");

export const contentItemSchema = z.object({
  day: z.number().int().min(0).max(6),
  format: z.enum(["reel", "carousel", "image"]),
  title: z.string().min(1).max(180),
  objective: z.string().min(1).max(500),
  hook: z.string().min(1).max(300),
  script: z.string().min(1).max(6000),
  caption: z.string().min(1).max(2200),
  materials: z.string().min(1).max(2000)
});
export const planSchema = z.object({
  rationale: z.string().min(1).max(3000),
  items: z.array(contentItemSchema).min(1).max(7)
});
export const createPlanSchema = z.object({
  week: weekSchema,
  count: z.number().int().min(1).max(7).default(4)
});
export const reviewPlanSchema = z.object({
  id: z.string().uuid(),
  revision: z.number().int().min(1),
  status: z.enum(["draft", "approved"]),
  content: planSchema
});
export type PlanContent = z.infer<typeof planSchema>;
export type ContentPlan = {
  id: string;
  week_start: string;
  status: "draft" | "approved";
  content: PlanContent;
  revision: number;
};

export function currentMonday(now = new Date()) {
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
  const date = new Date(`${localDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
