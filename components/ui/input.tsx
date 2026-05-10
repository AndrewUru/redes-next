import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "flex min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-700 aria-[invalid=true]:bg-red-50 dark:aria-[invalid=true]:border-red-300/40 dark:aria-[invalid=true]:bg-red-300/10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
