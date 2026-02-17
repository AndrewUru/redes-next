"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center rounded-xl border-2 border-border px-4 py-2 text-sm font-semibold text-foreground shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:translate-y-[1px] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)]",
        outline:
          "bg-background hover:bg-muted hover:translate-y-[1px] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)]",
        ghost:
          "border-transparent bg-transparent shadow-none hover:border-border hover:bg-muted hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
