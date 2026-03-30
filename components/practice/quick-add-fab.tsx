"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ClientFormModal } from "@/components/clients/client-form-modal";
import { AppModal } from "@/components/ui/app-modal";
import { MaskIcon } from "@/components/icons/mask-icon";
import { matters } from "@/lib/cases";
import { routes } from "@/lib/routes";

function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cl-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `cl-${Date.now().toString(36)}`;
}

const menuId = "practice-quick-add-menu";

export function PracticeQuickAddFab() {
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
            href={routes.cases}
            role="menuitem"
            onClick={closeMenu}
            className="flex min-h-10 min-w-36 items-center gap-2 rounded-xl border border-nyay-border bg-nyay-surface px-3 py-2 text-sm font-semibold text-nyay-trust shadow-md nyay-card-shadow transition-colors hover:bg-nyay-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:border-white/12 dark:bg-[#122238] dark:text-foreground dark:hover:bg-white/5 dark:focus-visible:ring-offset-[#0a1628]"
          >
            <MaskIcon name="briefcase" className="h-3.5 w-3.5 shrink-0 text-nyay-authority" />
            Add case
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              setClientModalOpen(true);
            }}
            className="flex min-h-10 min-w-36 items-center gap-2 rounded-xl border border-nyay-border bg-nyay-surface px-3 py-2 text-sm font-semibold text-nyay-trust shadow-md nyay-card-shadow transition-colors hover:bg-nyay-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:border-white/12 dark:bg-[#122238] dark:text-foreground dark:hover:bg-white/5 dark:focus-visible:ring-offset-[#0a1628]"
          >
            <MaskIcon name="user-circle" className="h-3.5 w-3.5 shrink-0 text-nyay-authority" />
            Add client
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              setDocPickerOpen(true);
            }}
            className="flex min-h-10 min-w-36 items-center gap-2 rounded-xl border border-nyay-border bg-nyay-surface px-3 py-2 text-sm font-semibold text-nyay-trust shadow-md nyay-card-shadow transition-colors hover:bg-nyay-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:border-white/12 dark:bg-[#122238] dark:text-foreground dark:hover:bg-white/5 dark:focus-visible:ring-offset-[#0a1628]"
          >
            <MaskIcon name="document-folded" className="h-3.5 w-3.5 shrink-0 text-nyay-authority" />
            Add document
          </button>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setMenuOpen((o) => !o)}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-nyay-trust text-white shadow-lg shadow-nyay-trust/30 transition-transform hover:bg-nyay-trust-mid focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#0a1628]"
        >
          <span className="sr-only">{menuOpen ? "Close quick add" : "Quick add"}</span>
          <MaskIcon
            name="plus"
            className={`h-6 w-6 transition-transform duration-200 ${menuOpen ? "rotate-45" : ""}`}
          />
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
                href={routes.case(m.id)}
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
