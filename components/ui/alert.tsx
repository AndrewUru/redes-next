import type { HTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const alertStyles = {
  info: "border-border bg-accent/60 text-accent-foreground",
  success: "border-success/25 bg-success/10 text-foreground",
  warning: "border-warning/30 bg-warning/10 text-foreground",
  danger: "border-danger/25 bg-danger/10 text-foreground"
} as const;

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle
};

export function Alert({
  tone = "info",
  title,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof alertStyles;
  title?: string;
}) {
  const Icon = icons[tone];
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3 text-sm",
        alertStyles[tone],
        className
      )}
      role={tone === "danger" ? "alert" : "status"}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div
          className={cn("leading-6", title && "mt-0.5 text-muted-foreground")}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
