import { intakeStepOrder, intakeStepSchemas, type IntakeData } from "@/lib/intake/schema";

export function calculateCompletionPct(data: Partial<IntakeData> | null | undefined): number {
  if (!data) return 0;

  const total = intakeStepOrder.length;
  let completed = 0;

  for (const step of intakeStepOrder) {
    const parsed = intakeStepSchemas[step].safeParse(data[step]);
    if (parsed.success) completed += 1;
  }

  return Math.round((completed / total) * 100);
}
