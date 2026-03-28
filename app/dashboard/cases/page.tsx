"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { mergeClients, clientDisplayName } from "@/lib/clients";
import { effectiveClientId } from "@/lib/matter-client-overrides";
import { matters, type CaseStatus } from "@/lib/cases";
import { useNyayStorage } from "@/lib/use-nyay-storage";

type StatusFilter = "all" | CaseStatus;

export default function CasesListingPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [view, setView] = useState<"list" | "card">("list");
  const { extraClients, overrides } = useNyayStorage();

  const allClients = useMemo(
    () => mergeClients(extraClients),
    [extraClients],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return matters.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (!q) return true;
      const cid = effectiveClientId(m, overrides);
      const clientName = clientDisplayName(cid, allClients);
      const blob = `${m.id} ${m.title} ${clientName} ${m.stage} ${m.court}`.toLowerCase();
      return blob.includes(q);
    });
  }, [query, status, overrides, allClients]);

  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-nyay-border pb-6">
          <p className="text-sm font-semibold tracking-wide text-nyay-authority uppercase">
            <Link href="/dashboard" className="transition-colors hover:text-nyay-authority-rich">
              Nyay Space
            </Link>
            <span className="text-nyay-muted/70"> / </span>
            Cases
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
            Case listing
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-nyay-muted">
            Search matters, filter by status, and switch between list and card views.
          </p>
        </header>

        <div
          className="mb-6 flex flex-col gap-4 rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
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
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-nyay-muted"
              aria-hidden
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </label>

          <fieldset className="flex flex-wrap items-center gap-2 border-0 p-0">
            <legend className="sr-only">Filter by status</legend>
            {(
              [
                { key: "all" as const, label: "All" },
                { key: "active" as const, label: "Active" },
                { key: "closed" as const, label: "Closed" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                aria-pressed={status === key}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  status === key
                    ? "bg-nyay-trust text-white shadow-sm dark:bg-nyay-trust-mid"
                    : "bg-nyay-canvas text-nyay-trust-mid hover:bg-nyay-border/40 dark:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </fieldset>

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
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
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
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            </button>
          </div>
        </div>

        <p className="mb-4 text-sm text-nyay-muted" aria-live="polite">
          {filtered.length === matters.length
            ? `${matters.length} matters`
            : `${filtered.length} of ${matters.length} matters`}
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
                          href={`/dashboard/cases/${encodeURIComponent(c.id)}`}
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
                          href={`/dashboard/clients/${encodeURIComponent(effectiveClientId(c, overrides))}`}
                          className="rounded outline-none transition-colors hover:text-nyay-trust-mid focus-visible:ring-2 focus-visible:ring-nyay-authority/40 dark:hover:text-foreground"
                        >
                          {clientDisplayName(effectiveClientId(c, overrides), allClients)}
                        </Link>
                      </td>
                      <td className="max-w-[200px] px-4 py-3 text-nyay-muted">{c.court}</td>
                      <td className="px-4 py-3 text-nyay-muted">{c.stage}</td>
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
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <li key={c.id}>
                <article className="flex h-full flex-col rounded-xl border border-nyay-border border-t-4 border-t-nyay-authority bg-nyay-surface p-4 nyay-card-shadow transition-shadow hover:shadow-lg hover:shadow-nyay-trust/10">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/dashboard/cases/${encodeURIComponent(c.id)}`}
                      className="font-mono text-xs text-nyay-authority-rich outline-none hover:underline focus-visible:ring-2 focus-visible:ring-nyay-authority/50 dark:text-nyay-authority"
                    >
                      {c.id}
                    </Link>
                    <StatusPill status={c.status} />
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-nyay-trust dark:text-foreground">
                    <Link
                      href={`/dashboard/cases/${encodeURIComponent(c.id)}`}
                      className="outline-none hover:text-nyay-trust-mid focus-visible:ring-2 focus-visible:ring-nyay-authority/50 dark:hover:text-foreground"
                    >
                      {c.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-nyay-muted">
                    <Link
                      href={`/dashboard/clients/${encodeURIComponent(effectiveClientId(c, overrides))}`}
                      className="rounded outline-none transition-colors hover:text-nyay-trust-mid focus-visible:ring-2 focus-visible:ring-nyay-authority/40 dark:hover:text-foreground"
                    >
                      {clientDisplayName(effectiveClientId(c, overrides), allClients)}
                    </Link>
                  </p>
                  <p className="mt-1 text-sm text-nyay-muted">{c.court}</p>
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
    </div>
  );
}

function StatusPill({ status }: { status: CaseStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
        isActive
          ? "bg-nyay-authority-soft text-nyay-authority-fg dark:text-nyay-authority"
          : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"
      }`}
    >
      {isActive ? "Active" : "Closed"}
    </span>
  );
}
