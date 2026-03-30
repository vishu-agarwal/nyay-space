"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MaskIcon } from "@/components/icons/mask-icon";
import { mergeClients, clientDisplayName } from "@/lib/clients";
import { effectiveClientId } from "@/lib/matter-client-overrides";
import type { CaseStatus, CaseType } from "@/lib/cases";
import { useAdvocateCaseList } from "@/lib/use-case-management-store";
import { useNyayStorage } from "@/lib/use-nyay-storage";
import { routes } from "@/lib/routes";
import { FilterOptionsMenu } from "@/components/practice/filter-options-menu";

type StatusFilter = "all" | CaseStatus;
type TypeFilter = "all" | CaseType;

export default function CasesListingPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [caseType, setCaseType] = useState<TypeFilter>("all");
  const [view, setView] = useState<"list" | "card">("list");
  const { extraClients, overrides } = useNyayStorage();
  const { cases } = useAdvocateCaseList();

  const allClients = useMemo(
    () => mergeClients(extraClients),
    [extraClients],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (caseType !== "all" && m.caseType !== caseType) return false;
      if (!q) return true;
      const cid = effectiveClientId({ id: m.id, clientId: m.clientId }, overrides);
      const clientName = clientDisplayName(cid, allClients);
      const blob = `${m.id} ${m.title} ${clientName} ${m.stage} ${m.court} ${m.caseType} ${m.status}`.toLowerCase();
      return blob.includes(q);
    });
  }, [query, status, caseType, overrides, allClients, cases]);

  return (
    <div className="min-h-full font-sans text-foreground">
      <header className="mb-5 border-b border-nyay-border pb-4">
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
          Case listing
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-nyay-muted">
          Search matters, filter by status, and switch between list and card views.
        </p>
      </header>

        <div
          className="mb-4 flex flex-col gap-3 rounded-xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          role="search"
        >
          <label className="relative min-w-[min(100%,280px)] flex-1">
            <span className="sr-only">Search cases</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, title, client, court…"
              className="w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2.5 pl-10 text-sm text-nyay-trust placeholder:text-nyay-muted/70 focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
            />
            <MaskIcon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nyay-muted"
            />
          </label>

          <FilterOptionsMenu
            title="Status"
            tone="trust"
            options={
              [
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "urgent", label: "Urgent" },
              { key: "closed", label: "Closed" },
              ] as const
            }
            value={status}
            onChange={setStatus}
            defaultValue="all"
          />

          <FilterOptionsMenu
            title="Type"
            tone="authority"
            options={
              [
              { key: "all", label: "All types" },
              { key: "civil", label: "Civil" },
              { key: "criminal", label: "Criminal" },
              { key: "family", label: "Family" },
              ] as const
            }
            value={caseType}
            onChange={setCaseType}
            defaultValue="all"
          />

          <div
            className="flex rounded-lg border border-nyay-border p-0.5"
            role="group"
            aria-label="Result layout"
          >
            <button
              type="button"
              onClick={() => setView("list")}
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
              onClick={() => setView("card")}
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

        <p className="mb-3 text-sm text-nyay-muted" aria-live="polite">
          {filtered.length === cases.length
            ? `${cases.length} cases`
            : `${filtered.length} of ${cases.length} cases`}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-surface px-6 py-12 text-center">
            <p className="font-medium text-nyay-trust dark:text-foreground">No matches</p>
            <p className="mt-1 text-sm text-nyay-muted">
              Try a different search or set status to All.
            </p>
          </div>
        ) : view === "list" ? (
          <div className="overflow-hidden rounded-xl border border-nyay-border bg-nyay-surface nyay-card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-nyay-border bg-nyay-canvas dark:bg-nyay-trust/10">
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Matter
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Client
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Court
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Stage
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Type
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Next
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-nyay-border/60 last:border-0 hover:bg-nyay-canvas/50 dark:hover:bg-nyay-trust/5"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={routes.case(c.id)}
                          className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority/50"
                        >
                          <span className="font-mono text-xs text-nyay-authority-rich group-hover:underline dark:text-nyay-authority">
                            {c.id}
                          </span>
                          <br />
                          <span className="font-medium text-nyay-trust group-hover:text-nyay-trust-mid dark:text-foreground dark:group-hover:text-foreground">
                            {c.title}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-nyay-muted">
                        <Link
                          href={routes.client(effectiveClientId(c, overrides))}
                          className="rounded outline-none transition-colors hover:text-nyay-trust-mid focus-visible:ring-2 focus-visible:ring-nyay-authority/40 dark:hover:text-foreground"
                        >
                          {clientDisplayName(effectiveClientId(c, overrides), allClients)}
                        </Link>
                      </td>
                      <td className="max-w-[200px] px-4 py-3 text-nyay-muted">{c.court}</td>
                      <td className="px-4 py-3 text-nyay-muted">{c.stage}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-nyay-authority/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-nyay-authority-fg dark:text-nyay-authority">
                          {formatCaseTypeLabel(c.caseType)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={c.status} />
                      </td>
                      <td className="px-4 py-3 tabular-nums font-medium text-nyay-trust-mid dark:text-foreground">
                        {c.next ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <li key={c.id}>
                <article className="flex h-full flex-col rounded-xl border border-nyay-border border-t-4 border-t-nyay-authority bg-nyay-surface p-3 nyay-card-shadow transition-shadow hover:shadow-lg hover:shadow-nyay-trust/10">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={routes.case(c.id)}
                      className="font-mono text-xs text-nyay-authority-rich outline-none hover:underline focus-visible:ring-2 focus-visible:ring-nyay-authority/50 dark:text-nyay-authority"
                    >
                      {c.id}
                    </Link>
                    <StatusPill status={c.status} />
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-nyay-trust dark:text-foreground">
                    <Link
                      href={routes.case(c.id)}
                      className="outline-none hover:text-nyay-trust-mid focus-visible:ring-2 focus-visible:ring-nyay-authority/50 dark:hover:text-foreground"
                    >
                      {c.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-nyay-muted">
                    <Link
                      href={routes.client(effectiveClientId(c, overrides))}
                      className="rounded outline-none transition-colors hover:text-nyay-trust-mid focus-visible:ring-2 focus-visible:ring-nyay-authority/40 dark:hover:text-foreground"
                    >
                      {clientDisplayName(effectiveClientId(c, overrides), allClients)}
                    </Link>
                  </p>
                  <p className="mt-1 text-sm text-nyay-muted">{c.court}</p>
                  <p className="mt-2 text-xs text-nyay-muted">
                    Type:{" "}
                    <span className="font-semibold text-nyay-trust-mid dark:text-foreground">
                      {formatCaseTypeLabel(c.caseType)}
                    </span>
                  </p>
                  <dl className="mt-4 grid gap-2 border-t border-nyay-border pt-4 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-nyay-muted">Stage</dt>
                      <dd className="text-right font-medium text-nyay-trust-mid dark:text-foreground">
                        {c.stage}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-nyay-muted">Next</dt>
                      <dd className="tabular-nums font-medium text-nyay-trust-mid dark:text-foreground">
                        {c.next ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </article>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

function StatusPill({ status }: { status: CaseStatus }) {
  const isActive = status === "active";
  const isUrgent = status === "urgent";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
        isActive
          ? "bg-nyay-authority-soft text-nyay-authority-fg dark:text-nyay-authority"
          : isUrgent
            ? "bg-red-500/12 text-red-900 ring-1 ring-red-600/25 dark:bg-red-400/12 dark:text-red-200 dark:ring-red-400/30"
            : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"
      }`}
    >
      {status === "active" ? "Active" : status === "urgent" ? "Urgent" : "Closed"}
    </span>
  );
}

function formatCaseTypeLabel(t: CaseType): string {
  switch (t) {
    case "civil":
      return "Civil";
    case "criminal":
      return "Criminal";
    case "family":
      return "Family";
  }
}
