"use client";

import type { ReactNode } from "react";
import { MaskIcon } from "@/components/icons/mask-icon";

export function SearchFilterToolbar({
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  view,
  onViewChange,
  children,
}: {
  searchLabel: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  view: "list" | "card";
  onViewChange: (value: "list" | "card") => void;
  children?: ReactNode;
}) {
  return (
    <div
      className="mb-4 flex flex-col gap-3 rounded-xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      role="search"
    >
      <label className="relative min-w-[min(100%,280px)] flex-1">
        <span className="sr-only">{searchLabel}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2.5 pl-10 text-sm text-nyay-trust placeholder:text-nyay-muted/70 focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
        />
        <MaskIcon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nyay-muted"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {children}
        <div
          className="flex rounded-lg border border-nyay-border p-0.5"
          role="group"
          aria-label="Result layout"
        >
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
            title="List view"
            aria-label="List view"
            className={`flex items-center justify-center rounded-md p-2 transition-colors ${
              view === "list"
                ? "bg-nyay-authority-soft text-nyay-authority-fg ring-1 ring-nyay-authority/40 dark:text-nyay-authority"
                : "text-nyay-muted hover:text-nyay-trust dark:hover:text-foreground"
            }`}
          >
            <MaskIcon name="layout-list" className="h-4 w-4 shrink-0" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("card")}
            aria-pressed={view === "card"}
            title="Card view"
            aria-label="Card view"
            className={`flex items-center justify-center rounded-md p-2 transition-colors ${
              view === "card"
                ? "bg-nyay-authority-soft text-nyay-authority-fg ring-1 ring-nyay-authority/40 dark:text-nyay-authority"
                : "text-nyay-muted hover:text-nyay-trust dark:hover:text-foreground"
            }`}
          >
            <MaskIcon name="layout-grid" className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
