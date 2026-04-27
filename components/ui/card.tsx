import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative min-w-0 rounded-[8px] border-2 border-border bg-background p-4 shadow-[6px_8px_0_0_rgba(0,0,0,1)] sm:p-5",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-2xl font-black leading-tight text-pretty", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm font-medium leading-relaxed text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
