import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCaseDetailForId,
  type TimelineEvent,
  type CaseDocument,
} from "@/lib/cases";
import { CaseClientBlock } from "./case-client-block";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = getCaseDetailForId(decodeURIComponent(id));
  if (!data) return { title: "Case not found | Nyay Space" };
  return {
    title: `${data.matter.id} — ${data.matter.title} | Nyay Space`,
    description: data.extra.synopsis ?? data.matter.title,
  };
}

const kindLabel: Record<TimelineEvent["kind"], string> = {
  hearing: "Hearing",
  filing: "Filing",
  order: "Order",
  mediation: "Mediation",
  note: "Note",
};

const docKindLabel: Record<CaseDocument["kind"], string> = {
  pleading: "Pleading",
  order: "Order",
  evidence: "Evidence",
  correspondence: "Correspondence",
};

export default async function CaseDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const data = getCaseDetailForId(id);
  if (!data) notFound();

  const { matter, extra } = data;
  const isActive = matter.status === "active";

  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-nyay-muted" aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            className="font-semibold text-nyay-authority transition-colors hover:text-nyay-authority-rich"
          >
            Nyay Space
          </Link>
          <span className="text-nyay-muted/70"> / </span>
          <Link
            href="/dashboard/cases"
            className="font-medium text-nyay-trust-mid transition-colors hover:text-nyay-trust dark:text-foreground/90"
          >
            Cases
          </Link>
          <span className="text-nyay-muted/70"> / </span>
          <span className="font-mono text-xs text-nyay-trust dark:text-foreground">
            {matter.id}
          </span>
        </nav>

        {/* Case info — trust blue + gold (authority) accents */}
        <header className="relative overflow-hidden rounded-2xl border border-white/15 bg-nyay-trust-soft nyay-hero-shadow dark:border-white/10 dark:bg-nyay-trust-mid">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-nyay-authority/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-2xl"
            aria-hidden
          />
          <div className="relative px-6 py-8 text-white sm:px-8 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold tracking-wide text-nyay-authority">
                    {matter.id}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                      isActive
                        ? "bg-nyay-authority/25 text-[#f5edd0] ring-1 ring-nyay-authority/50"
                        : "bg-white/10 text-white/80 ring-1 ring-white/20"
                    }`}
                  >
                    {isActive ? "Active" : "Closed"}
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  {matter.title}
                </h1>
                {extra.synopsis ? (
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
                    {extra.synopsis}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 lg:pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-nyay-authority">
                  Next in diary
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-white">
                  {matter.next ?? "—"}
                </p>
                {extra.nextHearing ? (
                  <p className="mt-1 text-sm text-white/75">{extra.nextHearing}</p>
                ) : null}
              </div>
            </div>

            <dl className="mt-8 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <CaseClientBlock matterId={matter.id} seedClientId={matter.clientId} />
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                  Court / forum
                </dt>
                <dd className="mt-1 text-sm font-medium text-white/90">{matter.court}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                  Stage
                </dt>
                <dd className="mt-1 text-sm font-medium text-white/90">{matter.stage}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                  Filed
                </dt>
                <dd className="mt-1 text-sm font-medium text-white/90">
                  {extra.filedOn ?? "—"}
                </dd>
              </div>
              {extra.judge ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                    Bench / arbitrator
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white/90">{extra.judge}</dd>
                </div>
              ) : null}
              {extra.opposingParty ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                    Opposing party
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white/90">
                    {extra.opposingParty}
                  </dd>
                </div>
              ) : null}
              {extra.opposingCounsel ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                    Opposing counsel
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white/90">
                    {extra.opposingCounsel}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Timeline — main */}
          <main aria-labelledby="timeline-heading">
            <h2
              id="timeline-heading"
              className="mb-6 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
            >
              <span
                className="h-1 w-8 rounded-full bg-nyay-authority"
                aria-hidden
              />
              Matter timeline
            </h2>

            {extra.timeline.length === 0 ? (
              <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-surface px-6 py-12 text-center nyay-card-shadow">
                <p className="font-medium text-nyay-trust dark:text-foreground">
                  No events yet
                </p>
                <p className="mt-1 text-sm text-nyay-muted">
                  Add hearings, filings, and orders to build your chronology.
                </p>
              </div>
            ) : (
              <ol className="relative space-y-0 pl-0">
                {extra.timeline.map((ev, index) => (
                  <li key={ev.id} className="relative flex gap-0 pb-10 last:pb-0">
                    {index < extra.timeline.length - 1 ? (
                      <span
                        className="absolute left-21 top-4 bottom-0 w-px bg-linear-to-b from-nyay-authority/70 to-nyay-border dark:from-nyay-authority/50"
                        aria-hidden
                      />
                    ) : null}
                    <div className="flex w-22 shrink-0 flex-col pt-0.5 text-right sm:w-28">
                      <time
                        dateTime={ev.date}
                        className="text-xs font-semibold tabular-nums text-nyay-authority-rich dark:text-nyay-authority"
                      >
                        {formatDisplayDate(ev.date)}
                      </time>
                      {ev.time ? (
                        <span className="mt-0.5 text-xs tabular-nums text-nyay-muted">
                          {ev.time}
                        </span>
                      ) : null}
                    </div>
                    <div className="relative flex shrink-0 justify-center px-3 sm:px-4">
                      <span
                        className="z-1 mt-1.5 h-3 w-3 rounded-full border-2 border-nyay-surface bg-nyay-authority shadow-[0_0_0_4px_rgba(201,162,39,0.2)] dark:border-nyay-surface dark:shadow-[0_0_0_4px_rgba(212,184,74,0.15)]"
                        aria-hidden
                      />
                    </div>
                    <article className="min-w-0 flex-1 rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow transition-shadow hover:shadow-lg hover:shadow-nyay-trust/8 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-nyay-authority-soft px-2 py-0.5 text-xs font-semibold text-nyay-authority-fg dark:text-nyay-authority">
                          {kindLabel[ev.kind]}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-nyay-trust dark:text-foreground">
                        {ev.title}
                      </h3>
                      {ev.detail ? (
                        <p className="mt-2 text-sm leading-relaxed text-nyay-muted">
                          {ev.detail}
                        </p>
                      ) : null}
                    </article>
                  </li>
                ))}
              </ol>
            )}
          </main>

          {/* Documents — side */}
          <aside
            className="lg:sticky lg:top-8 lg:self-start"
            aria-labelledby="documents-heading"
          >
            <h2
              id="documents-heading"
              className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
            >
              <span
                className="h-1 w-8 rounded-full bg-nyay-authority"
                aria-hidden
              />
              Documents
            </h2>
            <div className="rounded-xl border border-nyay-border bg-nyay-surface p-1 nyay-card-shadow">
              {extra.documents.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-nyay-trust dark:text-foreground">
                    No documents
                  </p>
                  <p className="mt-1 text-xs text-nyay-muted">
                    Upload pleadings, orders, and evidence here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-nyay-border/80">
                  {extra.documents.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        className="flex w-full items-start gap-3 rounded-lg px-3 py-3.5 text-left transition-colors hover:bg-nyay-canvas/80 dark:hover:bg-nyay-trust/10"
                      >
                        <span
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nyay-trust/5 text-nyay-authority ring-1 ring-nyay-authority/25 dark:bg-nyay-authority/10"
                          aria-hidden
                        >
                          <DocIcon />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-nyay-trust dark:text-foreground">
                            {doc.name}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-nyay-muted">
                            <span className="font-medium text-nyay-trust-mid dark:text-foreground/80">
                              {docKindLabel[doc.kind]}
                            </span>
                            <span className="text-nyay-muted/50">·</span>
                            <span>Updated {doc.updated}</span>
                            {doc.pages != null ? (
                              <>
                                <span className="text-nyay-muted/50">·</span>
                                <span className="tabular-nums">{doc.pages} pp.</span>
                              </>
                            ) : null}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-3 text-center text-xs text-nyay-muted">
              Preview and versioning connect here in production.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DocIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
