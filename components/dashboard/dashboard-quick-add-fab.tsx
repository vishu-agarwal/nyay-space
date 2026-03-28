"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { AppModal } from "@/components/ui/app-modal";
import { matters } from "@/lib/cases";

function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cl-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `cl-${Date.now().toString(36)}`;
}

const menuId = "dashboard-quick-add-menu";

export function DashboardQuickAddFab() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [docPickerOpen, setDocPickerOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div
        ref={rootRef}
        className="pointer-events-none fixed bottom-6 right-6 z-90 flex flex-col items-end gap-2 sm:bottom-8 sm:right-8"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div
          id={menuId}
          role="menu"
          aria-label="Quick add actions"
          className={[
            "pointer-events-auto flex flex-col items-end gap-2 transition-all duration-200",
            menuOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0",
          ].join(" ")}
        >
          <Link
            href="/dashboard/cases"
            role="menuitem"
            onClick={closeMenu}
            className="flex min-h-11 min-w-42 items-center gap-2 rounded-xl border border-nyay-border bg-nyay-surface px-4 py-2.5 text-sm font-semibold text-nyay-trust shadow-md nyay-card-shadow transition-colors hover:bg-nyay-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:border-white/12 dark:bg-[#122238] dark:text-foreground dark:hover:bg-white/5 dark:focus-visible:ring-offset-[#0a1628]"
          >
            <CaseGlyph className="h-4 w-4 shrink-0 text-nyay-authority" />
            Add case
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              setClientModalOpen(true);
            }}
            className="flex min-h-11 min-w-42 items-center gap-2 rounded-xl border border-nyay-border bg-nyay-surface px-4 py-2.5 text-sm font-semibold text-nyay-trust shadow-md nyay-card-shadow transition-colors hover:bg-nyay-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:border-white/12 dark:bg-[#122238] dark:text-foreground dark:hover:bg-white/5 dark:focus-visible:ring-offset-[#0a1628]"
          >
            <ClientGlyph className="h-4 w-4 shrink-0 text-nyay-authority" />
            Add client
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              setDocPickerOpen(true);
            }}
            className="flex min-h-11 min-w-42 items-center gap-2 rounded-xl border border-nyay-border bg-nyay-surface px-4 py-2.5 text-sm font-semibold text-nyay-trust shadow-md nyay-card-shadow transition-colors hover:bg-nyay-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:border-white/12 dark:bg-[#122238] dark:text-foreground dark:hover:bg-white/5 dark:focus-visible:ring-offset-[#0a1628]"
          >
            <DocGlyph className="h-4 w-4 shrink-0 text-nyay-authority" />
            Add document
          </button>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setMenuOpen((o) => !o)}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-nyay-trust text-white shadow-lg shadow-nyay-trust/30 transition-transform hover:bg-nyay-trust-mid focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#0a1628]"
        >
          <span className="sr-only">{menuOpen ? "Close quick add" : "Quick add"}</span>
          <PlusGlyph className={`h-7 w-7 transition-transform duration-200 ${menuOpen ? "rotate-45" : ""}`} />
        </button>
      </div>

      <ClientFormModal
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        mode="add"
        buildNewId={newClientId}
      />

      <AppModal
        open={docPickerOpen}
        onOpenChange={setDocPickerOpen}
        title="Add document"
        description="Open a matter to use the documents panel on the case page."
      >
        <ul className="max-h-[min(50vh,20rem)] space-y-1 overflow-y-auto pr-1">
          {matters.map((m) => (
            <li key={m.id}>
              <Link
                href={`/dashboard/cases/${encodeURIComponent(m.id)}`}
                onClick={() => setDocPickerOpen(false)}
                className="block rounded-lg border border-transparent px-3 py-2.5 text-left text-sm font-medium text-nyay-trust transition-colors hover:border-nyay-border hover:bg-nyay-canvas dark:text-foreground dark:hover:border-white/10 dark:hover:bg-white/5"
              >
                <span className="font-mono text-xs text-nyay-muted">{m.id}</span>
                <span className="mt-0.5 block leading-snug">{m.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </AppModal>
    </>
  );
}

function PlusGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CaseGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function ClientGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function DocGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}
