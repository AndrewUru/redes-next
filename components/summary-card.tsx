import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function SummaryCard({
  title,
  value,
  subtitle
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card className="group relative overflow-hidden transition-transform duration-200 hover:-translate-y-1">
      <span className="absolute inset-x-0 top-0 h-2 bg-primary" aria-hidden />
      <CardDescription className="pt-2 uppercase tracking-[0.14em]">{title}</CardDescription>
      <CardTitle className="number mt-1 text-foreground transition-transform duration-200 group-hover:scale-[1.03]">
        {value}
      </CardTitle>
      {subtitle ? <p className="mt-2 text-xs font-medium text-muted-foreground">{subtitle}</p> : null}
    </Card>
  );
}
