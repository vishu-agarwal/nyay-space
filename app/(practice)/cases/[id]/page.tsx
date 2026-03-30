import Link from "next/link";
import type { Metadata } from "next";
import { getCaseDetailForId } from "@/lib/cases";
import { routes } from "@/lib/routes";
import { CaseClientBlock } from "./case-client-block";
import { CaseDetailClient } from "@/components/case-management/case-detail-client";
import { DocumentsPanel } from "@/components/case-management/documents-panel";

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

export default async function CaseDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const data = getCaseDetailForId(id);

  const matter = data?.matter ?? null;
  const extra = data?.extra ?? null;

  const seedStatus = matter?.status ?? "active";
  const statusText = seedStatus === "urgent" ? "Urgent" : seedStatus === "closed" ? "Closed" : "Active";
  const isActiveLike = seedStatus === "active" || seedStatus === "urgent";

  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-7xl nyay-page-y">
        <nav className="mb-4 text-sm text-nyay-muted" aria-label="Breadcrumb">
          <Link
            href={routes.home}
            className="font-semibold text-nyay-authority transition-colors hover:text-nyay-authority-rich"
          >
            Nyay Space
          </Link>
          <span className="text-nyay-muted/70"> / </span>
          <Link
            href={routes.cases}
            className="font-medium text-nyay-trust-mid transition-colors hover:text-nyay-trust dark:text-foreground/90"
          >
            Cases
          </Link>
          <span className="text-nyay-muted/70"> / </span>
          <span className="font-mono text-xs text-nyay-trust dark:text-foreground">
            {matter?.id ?? id}
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
          <div className="relative px-5 py-6 text-white sm:px-6 sm:py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold tracking-wide text-nyay-authority">
                    {matter?.id ?? id}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                      seedStatus === "urgent"
                        ? "bg-red-500/20 text-red-200 ring-1 ring-red-400/30"
                        : isActiveLike
                          ? "bg-nyay-authority/25 text-[#f5edd0] ring-1 ring-nyay-authority/50"
                          : "bg-white/10 text-white/80 ring-1 ring-white/20"
                    }`}
                  >
                    {statusText}
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  {matter?.title ?? `Case ${id}`}
                </h1>
                {extra?.synopsis ? (
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
                  {matter?.next ?? "—"}
                </p>
                {extra?.nextHearing ? (
                  <p className="mt-1 text-sm text-white/75">{extra.nextHearing}</p>
                ) : null}
              </div>
            </div>

            <dl className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                {matter ? (
                  <CaseClientBlock matterId={matter.id} seedClientId={matter.clientId} />
                ) : (
                  <div className="text-sm font-medium text-white/90">Client (local)</div>
                )}
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                  Court / forum
                </dt>
                <dd className="mt-1 text-sm font-medium text-white/90">{matter?.court ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                  Stage
                </dt>
                <dd className="mt-1 text-sm font-medium text-white/90">{matter?.stage ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                  Filed
                </dt>
                <dd className="mt-1 text-sm font-medium text-white/90">
                  {extra?.filedOn ?? "—"}
                </dd>
              </div>
              {extra?.judge ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                    Bench / arbitrator
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white/90">{extra.judge}</dd>
                </div>
              ) : null}
              {extra?.opposingParty ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
                    Opposing party
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-white/90">
                    {extra.opposingParty}
                  </dd>
                </div>
              ) : null}
              {extra?.opposingCounsel ? (
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

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* Timeline — main */}
          <main aria-label="Case timeline and history">
            <CaseDetailClient caseId={id} seedMatter={matter} seedExtra={extra} />
          </main>

          {/* Documents — side */}
          <aside
            className="lg:sticky lg:top-6 lg:self-start"
            aria-labelledby="documents-heading"
          >
            <div id="documents-heading">
              <DocumentsPanel documents={extra?.documents ?? []} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
