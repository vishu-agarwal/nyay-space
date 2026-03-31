"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { mergeClients } from "@/lib/clients";
import {
  runGlobalSearch,
  type GlobalSearchHit,
  type GlobalSearchKind,
} from "@/lib/global-search";
import { MaskIcon } from "@/components/icons/mask-icon";
import { useNyayStorage } from "@/lib/use-nyay-storage";

const KIND_LABEL: Record<GlobalSearchKind, string> = {
  case: "Cases",
  client: "Clients",
  document: "Documents",
};

export function GlobalSearch() {
  const router = useRouter();
  const { extraClients, overrides } = useNyayStorage();
  const dialogId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const allClients = useMemo(() => mergeClients(extraClients), [extraClients]);

  const hits = useMemo(
    () => runGlobalSearch(query, allClients, overrides),
    [query, allClients, overrides],
  );

  const { displayRows, flat } = useMemo(() => {
    const order: GlobalSearchKind[] = ["case", "client", "document"];
    const byKind = new Map<GlobalSearchKind, GlobalSearchHit[]>();
    for (const k of order) byKind.set(k, []);
    for (const h of hits) byKind.get(h.kind)?.push(h);
    type Row =
      | { type: "heading"; kind: GlobalSearchKind }
      | { type: "hit"; hit: GlobalSearchHit; selectableIndex: number };
    const rows: Row[] = [];
    const flat: GlobalSearchHit[] = [];
    let selectableIndex = 0;
    for (const kind of order) {
      const list = byKind.get(kind) ?? [];
      if (list.length === 0) continue;
      rows.push({ type: "heading", kind });
      for (const hit of list) {
        rows.push({ type: "hit", hit, selectableIndex });
        flat.push(hit);
        selectableIndex += 1;
      }
    }
    return { displayRows: rows, flat };
  }, [hits]);

  const selectableCount = flat.length;

  useEffect(() => {
    setActive(0);
  }, [hits]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const goTo = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onDocKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (selectableCount ? (i + 1) % selectableCount : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) =>
          selectableCount ? (i - 1 + selectableCount) % selectableCount : 0,
        );
        return;
      }
      if (e.key === "Enter" && selectableCount > 0) {
        const hit = flat[active];
        if (hit) {
          e.preventDefault();
          goTo(hit.href);
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, active, flat, selectableCount, goTo]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const activeEl = listRef.current.querySelector(`[data-select-index="${active}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [active, open, displayRows]);

  const mac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <>
      <div className="hidden w-full min-w-0 max-w-md md:block lg:max-w-lg">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-nyay-border bg-nyay-canvas/80 px-3 py-2 text-left text-sm text-nyay-muted shadow-sm transition hover:border-nyay-trust/25 hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? dialogId : undefined}
        >
          <MaskIcon name="search" className="h-4 w-4 shrink-0 opacity-70" />
          <span className="min-w-0 flex-1 truncate">Search cases, clients, documents…</span>
          <kbd className="hidden shrink-0 rounded border border-nyay-border bg-nyay-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-nyay-muted sm:inline dark:border-white/15">
            {mac ? "⌘" : "Ctrl"}K
          </kbd>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-nyay-border text-nyay-trust transition hover:bg-nyay-canvas md:hidden dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
        aria-label="Open search"
      >
        <MaskIcon name="search" className="h-5 w-5" />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-120 flex items-start justify-center bg-nyay-trust/40 p-4 pt-[min(12vh,6rem)] backdrop-blur-sm dark:bg-black/60"
              role="presentation"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
              }}
            >
              <div
                id={dialogId}
                role="dialog"
                aria-modal="true"
                aria-label="Global search"
                className="flex max-h-[min(70vh,32rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-nyay-border bg-nyay-surface shadow-xl dark:border-white/10 dark:bg-[#122238]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="border-b border-nyay-border p-3 dark:border-white/10">
                  <label className="relative block">
                    <span className="sr-only">Search</span>
                    <MaskIcon
                      name="search"
                      className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-nyay-muted"
                    />
                    <input
                      ref={inputRef}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Case, client, or document…"
                      autoComplete="off"
                      className="w-full rounded-xl border border-nyay-border bg-nyay-canvas py-3 pl-11 pr-3 text-sm text-nyay-trust placeholder:text-nyay-muted/70 focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:border-white/10 dark:bg-nyay-trust/20 dark:text-foreground"
                    />
                  </label>
                </div>

                <ul
                  ref={listRef}
                  className="min-h-0 flex-1 overflow-y-auto p-2"
                  role="listbox"
                  aria-label="Search results"
                >
                  {query.trim() === "" ? (
                    <li className="px-3 py-8 text-center text-sm text-nyay-muted">
                      Type to search across cases, clients, and documents.
                    </li>
                  ) : hits.length === 0 ? (
                    <li className="px-3 py-8 text-center text-sm text-nyay-muted">
                      No matches. Try another keyword.
                    </li>
                  ) : (
                    displayRows.map((row) => {
                      if (row.type === "heading") {
                        return (
                          <li
                            key={`h-${row.kind}`}
                            className="px-3 pb-1 pt-3 text-xs font-semibold tracking-wide text-nyay-muted uppercase first:pt-1"
                            role="presentation"
                          >
                            {KIND_LABEL[row.kind]}
                          </li>
                        );
                      }
                      const selected = row.selectableIndex === active;
                      return (
                        <li key={`${row.hit.kind}-${row.hit.href}`} role="presentation">
                          <Link
                            href={row.hit.href}
                            data-select-index={row.selectableIndex}
                            onClick={() => setOpen(false)}
                            onMouseEnter={() => setActive(row.selectableIndex)}
                            className={[
                              "flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors",
                              selected
                                ? "bg-nyay-authority-soft ring-1 ring-nyay-authority/35 dark:bg-nyay-authority/15 dark:ring-nyay-authority/25"
                                : "hover:bg-nyay-canvas dark:hover:bg-white/5",
                            ].join(" ")}
                            role="option"
                            aria-selected={selected}
                          >
                            <span className="truncate text-sm font-medium text-nyay-trust dark:text-foreground">
                              {row.hit.title}
                            </span>
                            <span className="mt-0.5 truncate text-xs text-nyay-muted">
                              {row.hit.subtitle}
                            </span>
                          </Link>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
