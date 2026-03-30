"use client";

import { useMemo, useState } from "react";
import type { CaseDetailExtra, Matter, TimelineEvent, CaseStatus, CaseType } from "@/lib/cases";
import { useAdvocateCaseDetail } from "@/lib/use-case-management-store";
import { CasePracticeNotes } from "@/components/notes/case-practice-notes";
import { AddTimelineEventModal } from "@/components/case-management/add-timeline-event-modal";
import { CaseStatusTypeEditor } from "@/components/case-management/case-status-type-editor";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { useNyayStorage } from "@/lib/use-nyay-storage";
import { mergeClients, clientDisplayName } from "@/lib/clients";
import { effectiveClientId } from "@/lib/matter-client-overrides";
import { MaskIcon } from "@/components/icons/mask-icon";

const kindLabel: Record<TimelineEvent["kind"], string> = {
  hearing: "Hearing",
  filing: "Filing",
  order: "Order",
  mediation: "Mediation",
  note: "Note",
};

function statusLabel(status: CaseStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "urgent":
      return "Urgent";
    case "closed":
      return "Closed";
  }
}

function statusPillClass(status: CaseStatus): string {
  switch (status) {
    case "active":
      return "bg-nyay-authority-soft text-nyay-authority-fg ring-1 ring-nyay-border dark:text-nyay-authority";
    case "urgent":
      return "bg-red-500/12 text-red-900 ring-1 ring-red-600/25 dark:bg-red-400/12 dark:text-red-200 dark:ring-red-400/30";
    case "closed":
      return "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border dark:bg-white/[0.06] dark:text-nyay-muted";
  }
}

function caseTypeLabel(t: CaseType): string {
  switch (t) {
    case "civil":
      return "Civil";
    case "criminal":
      return "Criminal";
    case "family":
      return "Family";
  }
}

function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string, max = 240): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

export function CaseDetailClient({
  caseId,
  seedMatter,
  seedExtra,
}: {
  caseId: string;
  seedMatter?: Matter | null;
  seedExtra?: CaseDetailExtra | null;
}) {
  const { caseDetail, historyItems, actions } = useAdvocateCaseDetail({
    caseId,
    seedMatter,
    seedExtra,
  });

  const [addOpen, setAddOpen] = useState(false);
  const { extraClients, overrides } = useNyayStorage();
  const allClients = useMemo(() => mergeClients(extraClients), [extraClients]);

  const effectiveClient = effectiveClientId(
    { id: caseId, clientId: caseDetail.clientId },
    overrides,
  );

  const clientName = useMemo(() => {
    if (!effectiveClient) return "—";
    return clientDisplayName(effectiveClient, allClients);
  }, [effectiveClient, allClients]);

  const currentStatus = caseDetail.status;
  const currentType = caseDetail.caseType;

  return (
    <>
      <div className="rounded-2xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
                  statusPillClass(currentStatus),
                ].join(" ")}
              >
                {statusLabel(currentStatus)}
              </span>
              <span className="rounded-full bg-nyay-authority/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-nyay-authority-fg dark:text-nyay-authority">
                {caseTypeLabel(currentType)}
              </span>
            </div>
            <p className="mt-2 text-sm text-nyay-muted">
              Client:{" "}
              {effectiveClient ? (
                <Link
                  href={routes.client(effectiveClient)}
                  className="font-medium text-nyay-trust-mid underline-offset-2 hover:underline dark:text-foreground"
                >
                  {clientName}
                </Link>
              ) : (
                <span className="font-medium text-nyay-trust-mid">{clientName}</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-nyay-trust px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 transition-all hover:bg-nyay-trust-mid focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-surface dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#122238]"
            >
              <MaskIcon name="plus" className="h-4 w-4" />
              Add event
            </button>
          </div>
        </div>

        <div className="mt-4">
          <CaseStatusTypeEditor
            status={currentStatus}
            caseType={currentType}
            onStatusChange={(next) => actions.setStatus(next)}
            onTypeChange={(next) => actions.setType(next)}
          />
        </div>
      </div>

      <div className="mt-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground">
          <span className="h-1 w-8 rounded-full bg-nyay-authority" aria-hidden />
          Case timeline
        </h2>

        {caseDetail.timeline.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-surface px-5 py-8 text-center nyay-card-shadow">
            <p className="font-medium text-nyay-trust dark:text-foreground">No events yet</p>
            <p className="mt-1 text-sm text-nyay-muted">Add hearings, filings, orders, and notes to build chronology.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {caseDetail.timeline.map((ev) => (
              <li key={ev.id}>
                <article className="min-w-0 rounded-xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <time className="text-xs font-semibold tabular-nums text-nyay-authority-rich">
                        {formatDisplayDate(ev.date)}
                        {ev.time ? <span className="ml-2 text-xs text-nyay-muted">{ev.time}</span> : null}
                      </time>
                      <span className="inline-flex w-fit rounded-md bg-nyay-authority-soft px-2 py-0.5 text-xs font-semibold text-nyay-authority-fg dark:text-nyay-authority">
                        {kindLabel[ev.kind]}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-nyay-trust dark:text-foreground">{ev.title}</h3>
                  {ev.detail ? (
                    <p className="mt-1 text-sm leading-relaxed text-nyay-muted">{ev.detail}</p>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground">
          <span className="h-1 w-8 rounded-full bg-nyay-authority" aria-hidden />
          Case history
        </h2>

        {historyItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-nyay-border bg-nyay-surface px-5 py-8 text-center nyay-card-shadow">
            <p className="font-medium text-nyay-trust dark:text-foreground">No history yet</p>
            <p className="mt-1 text-sm text-nyay-muted">Status changes, timeline events, and case notes will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {[...historyItems].reverse().map((h) => (
              <li key={h.id}>
                <article className="min-w-0 rounded-xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <time className="text-xs font-semibold tabular-nums text-nyay-authority-rich">
                      {formatDisplayDateTime(h.createdAt)}
                    </time>
                    <span className="rounded-md bg-nyay-canvas px-2 py-0.5 text-xs font-semibold text-nyay-trust-mid ring-1 ring-nyay-border">
                      {h.kind === "status" ? "Status" : h.kind === "timeline" ? "Timeline" : "Note"}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-nyay-trust dark:text-foreground">{h.title}</h3>
                  {h.detail ? (
                    <p className="mt-1 text-sm leading-relaxed text-nyay-muted">{truncate(h.detail)}</p>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <CasePracticeNotes entityId={caseId} />
      </div>

      <AddTimelineEventModal open={addOpen} onOpenChange={setAddOpen} caseId={caseId} />
    </>
  );
}

