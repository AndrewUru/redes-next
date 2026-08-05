import type { ReactNode } from "react";

export function DropdownMenu({
  trigger,
  children,
  align = "right"
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <details className="group relative">
      <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
        {trigger}
      </summary>
      <div
        className={`absolute top-full z-40 mt-2 min-w-48 rounded-lg border border-border bg-surface-elevated p-1 shadow-md ${align === "right" ? "right-0" : "left-0"}`}
      >
        {children}
      </div>
    </details>
  );
}

export function DropdownMenuItem({
  children,
  destructive = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { destructive?: boolean }) {
  return (
    <button
      type="button"
      className={`flex min-h-10 w-full items-center rounded-md px-3 text-left text-sm ${destructive ? "text-danger hover:bg-danger/10" : "hover:bg-muted"}`}
      {...props}
    >
      {children}
    </button>
  );
}
