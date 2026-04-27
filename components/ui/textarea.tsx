import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-[8px] border-2 border-border bg-background px-3 py-2 text-sm shadow-[2px_3px_0_0_rgba(0,0,0,1)] ring-offset-background transition-[background-color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-700 aria-[invalid=true]:bg-red-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
