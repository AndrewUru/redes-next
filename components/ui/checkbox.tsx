import * as React from "react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "h-5 w-5 rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";

export function RadioGroup({
  legend,
  children,
  className
}: {
  legend: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("space-y-3", className)}>
      <legend className="text-sm font-medium">{legend}</legend>
      {children}
    </fieldset>
  );
}
