import { cn } from "@/lib/utils";

export function Progress({
  value,
  className
}: {
  value: number;
  className?: string;
}) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full border border-border/60 bg-black/10",
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(normalized)}
    >
      <div
        className="progress-fill h-full rounded-full border-r border-black/30 transition-[width] duration-500 ease-out"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
