"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Sheet({
  open,
  onOpenChange,
  title,
  children
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const sheet = ref.current;
    if (!sheet) return;
    if (open && !sheet.open) sheet.showModal();
    if (!open && sheet.open) sheet.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
      className="ml-auto mr-0 h-dvh w-[min(90vw,24rem)] max-w-none overscroll-contain bg-surface p-0 text-foreground shadow-md backdrop:bg-black/50"
    >
      <section className="flex h-full flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-4">
          <h2 className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </section>
    </dialog>
  );
}
