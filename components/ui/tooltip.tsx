import { useId, type ReactNode } from "react";

export function Tooltip({
  content,
  children
}: {
  content: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <span className="group relative inline-flex" aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs text-background shadow-md group-focus-within:block group-hover:block"
      >
        {content}
      </span>
    </span>
  );
}
