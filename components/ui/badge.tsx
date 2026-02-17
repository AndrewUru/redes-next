import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border-2 border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
        className
      )}
      {...props}
    />
  );
}
