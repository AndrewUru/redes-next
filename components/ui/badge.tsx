import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-semibold leading-none text-foreground",
        className
      )}
      {...props}
    />
  );
}
