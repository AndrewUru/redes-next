import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-center text-sm font-semibold leading-tight transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        outline: "border-border bg-surface text-foreground hover:bg-muted",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-muted",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/75",
        danger:
          "border-danger bg-danger text-danger-foreground hover:bg-danger/90"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export { buttonVariants, type ButtonVariantProps };
