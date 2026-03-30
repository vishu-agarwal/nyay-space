"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type FilterTone = "trust" | "authority";

const toneStyles: Record<
  FilterTone,
  {
    label: string;
    active: string;
    inactive: string;
  }
> = {
  trust: {
    label: "text-nyay-muted text-xs font-semibold uppercase tracking-wide",
    active:
      "bg-nyay-trust text-white shadow-sm dark:bg-nyay-trust-mid",
    inactive:
      "bg-nyay-canvas text-nyay-trust-mid hover:bg-nyay-border/40 dark:text-foreground",
  },
  authority: {
    label: "text-nyay-muted text-xs font-semibold uppercase tracking-wide",
    active:
      "bg-nyay-authority text-white shadow-sm dark:bg-nyay-authority/80",
    inactive:
      "bg-nyay-canvas text-nyay-trust-mid hover:bg-nyay-border/40 dark:text-foreground",
  },
};

export function FilterOptionsMenu<T extends string>({
  title,
  options,
  value,
  onChange,
  defaultValue,
  appliedCount,
  tone = "trust",
}: {
  title: string;
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  defaultValue?: T;
  appliedCount?: number;
  tone?: FilterTone;
}) {
  const styles = toneStyles[tone];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const target = e.target as Node;
      if (el.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const computedApplied =
    appliedCount != null ? appliedCount : defaultValue != null && value !== defaultValue ? 1 : 0;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-nyay-border bg-nyay-surface px-3 py-2 text-left shadow-sm transition-colors hover:bg-nyay-canvas/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority"
      >
        <span className={styles.label}>{title}</span>
        {computedApplied > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-nyay-authority px-1.5 text-[11px] font-bold leading-none text-white">
            {computedApplied}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={`${title} options`}
          className="absolute left-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-nyay-border bg-nyay-surface p-1 shadow-lg"
        >
          {options.map((opt) => {
            const active = value === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active
                    ? styles.active
                    : "bg-nyay-surface text-nyay-trust-mid hover:bg-nyay-canvas/70 dark:bg-nyay-surface dark:hover:bg-nyay-trust/10"
                }`}
                aria-checked={active}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

