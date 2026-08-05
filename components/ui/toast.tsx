import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Toast({
  children,
  tone = "default",
  className
}: {
  children: ReactNode;
  tone?: "default" | "success" | "danger";
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border bg-surface-elevated px-4 py-3 text-sm shadow-md",
        tone === "success" && "border-success/25",
        tone === "danger" && "border-danger/25",
        className
      )}
    >
      {children}
    </div>
  );
}
