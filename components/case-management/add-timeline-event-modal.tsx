"use client";

import { useEffect, useState } from "react";
import type { TimelineKind } from "@/lib/cases";
import { AppModal } from "@/components/ui/app-modal";

import { addTimelineEvent } from "@/lib/case-management-store";

const kindOptions: { value: TimelineKind; label: string }[] = [
  { value: "hearing", label: "Hearing" },
  { value: "filing", label: "Filing" },
  { value: "order", label: "Order" },
  { value: "mediation", label: "Mediation" },
  { value: "note", label: "Timeline note" },
];

function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AddTimelineEventModal({
  open,
  onOpenChange,
  caseId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
}) {
  const [kind, setKind] = useState<TimelineKind>("hearing");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      setError(null);
      setKind("hearing");
      setDate(toLocalISODate(new Date()));
      setTime("");
      setTitle("");
      setDetail("");
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!date.trim()) {
      setError("Date is required.");
      return;
    }

    addTimelineEvent(caseId, {
      date,
      time: time.trim() ? time.trim() : undefined,
      title,
      detail: detail.trim() ? detail.trim() : undefined,
      kind,
    });
    onOpenChange(false);
  }

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add timeline event"
      description="Hearings, filings, orders, mediation sessions, or timeline notes."
    >
      <form onSubmit={onSubmit} className="space-y-3" aria-label="Add timeline event form">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="ate-kind" className="block text-xs font-medium text-nyay-trust-mid">
              Type <span className="text-nyay-authority">*</span>
            </label>
            <select
              id="ate-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as TimelineKind)}
              className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
            >
              {kindOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ate-date" className="block text-xs font-medium text-nyay-trust-mid">
              Date <span className="text-nyay-authority">*</span>
            </label>
            <input
              id="ate-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ate-time" className="block text-xs font-medium text-nyay-trust-mid">
            Time (optional)
          </label>
          <input
            id="ate-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
          />
        </div>

        <div>
          <label htmlFor="ate-title" className="block text-xs font-medium text-nyay-trust-mid">
            Title <span className="text-nyay-authority">*</span>
          </label>
          <input
            id="ate-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
            placeholder="e.g. First hearing — directions"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="ate-detail" className="block text-xs font-medium text-nyay-trust-mid">
            Details (optional)
          </label>
          <textarea
            id="ate-detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30"
            placeholder="Add any quick context, next steps, or order summary."
          />
        </div>

        {error ? (
          <p className="text-sm text-red-700 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-nyay-border px-4 py-2.5 text-sm font-semibold text-nyay-trust-mid transition-colors hover:bg-nyay-canvas dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 transition-all hover:bg-nyay-trust-mid focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-surface dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#122238]"
          >
            Add event
          </button>
        </div>
      </form>
    </AppModal>
  );
}

