import { cn } from "@/lib/utils";

export function Avatar({
  name,
  className
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground",
        className
      )}
    >
      {initials}
    </span>
  );
}
