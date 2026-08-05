import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({
  items
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="Migas de pan">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-1"
          >
            {index > 0 ? (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : null}
            {item.href ? (
              <Link href={item.href as Route} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
