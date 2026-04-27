"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-2 border-border px-4 py-2 text-center text-sm font-semibold leading-tight text-foreground shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-55 disabled:shadow-[2px_3px_0_0_rgba(0,0,0,0.55)]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:translate-y-[1px] hover:bg-[#f7a9c9] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[1px_2px_0_0_rgba(0,0,0,1)]",
        outline:
          "bg-background hover:translate-y-[1px] hover:bg-muted hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[1px_2px_0_0_rgba(0,0,0,1)]",
        ghost:
          "border-transparent bg-transparent shadow-none hover:border-border hover:bg-muted hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] active:translate-y-[1px]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
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
