"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AppModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="nyay-app-modal fixed left-1/2 top-1/2 z-[200] m-0 max-h-[min(90vh,40rem)] w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-nyay-border bg-nyay-surface p-0 text-nyay-trust shadow-xl outline-none dark:border-white/10 dark:bg-[#122238] dark:text-foreground"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange(false);
      }}
    >
      <div className="max-h-[min(90vh,40rem)] overflow-y-auto">
        <div className="sticky top-0 z-1 flex items-start justify-between gap-3 border-b border-nyay-border bg-nyay-surface px-5 py-4 dark:border-white/10 dark:bg-[#122238]">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-nyay-trust dark:text-foreground">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-sm text-nyay-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="shrink-0 rounded-lg p-2 text-nyay-muted transition-colors hover:bg-nyay-canvas hover:text-nyay-trust dark:hover:bg-white/10 dark:hover:text-foreground"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 border-t border-nyay-border bg-nyay-surface px-5 py-4 dark:border-white/10 dark:bg-[#122238]">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
