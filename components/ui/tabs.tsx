"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  items,
  defaultValue
}: {
  items: Array<{ value: string; label: string; content: ReactNode }>;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? items[0]?.value);
  return (
    <div>
      <div
        role="tablist"
        className="inline-flex rounded-lg border border-border bg-surface p-1"
      >
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={value === item.value}
            onClick={() => setValue(item.value)}
            className={cn(
              "min-h-9 rounded-md px-3 text-sm font-medium",
              value === item.value
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) =>
        value === item.value ? (
          <div key={item.value} role="tabpanel" className="mt-4">
            {item.content}
          </div>
        ) : null
      )}
    </div>
  );
}
