"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addPracticeNote,
  deletePracticeNote,
  parseNotesMap,
} from "@/lib/practice-notes";
import {
  NYAY_CASE_NOTES_KEY,
  subscribeNyayStorage,
} from "@/lib/nyay-storage-events";
import { useSyncExternalStore } from "react";

import type { PracticeNote } from "@/lib/practice-notes";

const SSR_SNAPSHOT = "\0case_notes_ssr\0";

function snapshotForCaseNotes(): string {
  if (typeof window === "undefined") return SSR_SNAPSHOT;
  return window.localStorage.getItem(NYAY_CASE_NOTES_KEY) ?? "{}";
}

function useCasePracticeNotes(entityId: string) {
  const raw = useSyncExternalStore(
    subscribeNyayStorage,
    () => snapshotForCaseNotes(),
    () => SSR_SNAPSHOT,
  );

  return useMemo(() => {
    if (raw === SSR_SNAPSHOT) return [] as PracticeNote[];
    const map = parseNotesMap(raw);
    return [...(map[entityId] ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [raw, entityId]);
}

export function CasePracticeNotes({
  entityId,
  caseLabel,
  labelId,
}: {
  entityId: string;
  /** Shown in the heading for clarity (e.g. matter id). */
  caseLabel?: string;
  labelId?: string;
}) {
  const notes = useCasePracticeNotes(entityId);
  const [draft, setDraft] = useState("");
  const [hearing, setHearing] = useState(false);

  const fieldId = labelId ?? `case-notes-${entityId}`;

  const handleAdd = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    addPracticeNote("case", entityId, t, hearing ? { context: "hearing" } : undefined);
    setDraft("");
    setHearing(false);
  }, [draft, entityId, hearing]);

  const handleDelete = useCallback(
    (noteId: string) => {
      if (typeof window !== "undefined" && !window.confirm("Remove this note?")) {
        return;
      }
      deletePracticeNote("case", entityId, noteId);
    },
    [entityId],
  );

  const hearingCount = notes.filter((n) => n.context === "hearing").length;

  return (
    <section
      className="rounded-2xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow"
      aria-labelledby={`${fieldId}-heading`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id={`${fieldId}-heading`}
            className="flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
          >
            <span className="h-1 w-8 rounded-full bg-nyay-authority" aria-hidden />
            Case notes
          </h2>
          <p className="mt-1 text-sm text-nyay-muted">
            Linked to this case
            {caseLabel ? (
              <>
                {" "}
                <span className="font-mono text-xs text-nyay-trust-mid dark:text-foreground/80">
                  ({caseLabel})
                </span>
              </>
            ) : null}
            . Each entry is stored with a timestamp. Saved in this browser only.
          </p>
        </div>
        {hearingCount > 0 ? (
          <span className="shrink-0 rounded-full bg-nyay-authority/15 px-2.5 py-1 text-xs font-semibold text-nyay-authority-fg dark:bg-nyay-authority/25 dark:text-nyay-authority">
            {hearingCount} hearing {hearingCount === 1 ? "note" : "notes"}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <label htmlFor={`${fieldId}-input`} className="sr-only">
          New note
        </label>
        <textarea
          id={`${fieldId}-input`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="Write observations, orders, or next steps—useful during hearings or after court."
          className="w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust placeholder:text-nyay-muted/60 focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-nyay-trust dark:text-foreground">
            <input
              type="checkbox"
              checked={hearing}
              onChange={(e) => setHearing(e.target.checked)}
              className="h-4 w-4 rounded border-nyay-border text-nyay-trust focus:ring-nyay-authority"
            />
            <span>Hearing note</span>
            <span className="text-xs font-normal text-nyay-muted">(tags this entry for the diary)</span>
          </label>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!draft.trim()}
            className="rounded-lg bg-nyay-trust px-4 py-2 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 transition-all hover:bg-nyay-trust-mid hover:shadow-lg hover:shadow-nyay-trust/25 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-surface dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#122238]"
          >
            Save note
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-nyay-border/80 bg-nyay-canvas/50 px-4 py-8 text-center text-sm text-nyay-muted dark:bg-nyay-trust/5">
          No notes yet. Add one above; enable &quot;Hearing note&quot; when you are capturing the board or order in court.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-nyay-border/90 bg-nyay-canvas/40 p-4 dark:bg-nyay-trust/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <time
                    dateTime={n.createdAt}
                    className="shrink-0 text-xs font-semibold tabular-nums text-nyay-authority-rich dark:text-nyay-authority"
                  >
                    {formatNoteWhen(n.createdAt)}
                  </time>
                  {n.context === "hearing" ? (
                    <span className="rounded-md bg-nyay-authority-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-nyay-authority-fg dark:text-nyay-authority">
                      Hearing
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-nyay-muted transition-colors hover:bg-nyay-trust/10 hover:text-nyay-trust dark:hover:text-foreground"
                >
                  Remove
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-nyay-trust dark:text-foreground">
                {n.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatNoteWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
