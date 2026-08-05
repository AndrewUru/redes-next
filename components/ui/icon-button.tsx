import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IconButton({
  className,
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  if (!ariaLabel) throw new Error("IconButton requires an aria-label");
  return (
    <Button
      aria-label={ariaLabel}
      className={cn("h-11 w-11 shrink-0 px-0", className)}
      {...props}
    />
  );
}
