"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { AppModal } from "@/components/ui/app-modal";
import {
  addPracticeNote,
  deletePracticeNote,
  parseNotesMap,
  type NotesEntity,
} from "@/lib/practice-notes";
import {
  NYAY_CASE_NOTES_KEY,
  NYAY_CLIENT_NOTES_KEY,
  subscribeNyayStorage,
} from "@/lib/nyay-storage-events";

const SSR_SNAPSHOT = "\0notes_ssr\0";

function snapshotForEntity(entity: NotesEntity): string {
  if (typeof window === "undefined") return SSR_SNAPSHOT;
  const key = entity === "case" ? NYAY_CASE_NOTES_KEY : NYAY_CLIENT_NOTES_KEY;
  return window.localStorage.getItem(key) ?? "{}";
}

function useEntityPracticeNotes(entity: NotesEntity, entityId: string) {
  const raw = useSyncExternalStore(
    subscribeNyayStorage,
    () => snapshotForEntity(entity),
    () => SSR_SNAPSHOT,
  );

  return useMemo(() => {
    if (raw === SSR_SNAPSHOT) return [];
    const map = parseNotesMap(raw);
    return [...(map[entityId] ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [raw, entityId]);
}

type Props = {
  entity: NotesEntity;
  entityId: string;
  /** Screen-reader / analytics id prefix */
  labelId?: string;
};

export function EntityPracticeNotes({ entity, entityId, labelId }: Props) {
  const notes = useEntityPracticeNotes(entity, entityId);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  const fieldId = labelId ?? `practice-notes-${entity}-${entityId}`;

  const handleAdd = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    addPracticeNote(entity, entityId, t);
    setDraft("");
  }, [draft, entity, entityId]);

  const handleDelete = useCallback(
    (noteId: string) => {
      if (
        typeof window !== "undefined" &&
        !window.confirm("Remove this note from this browser?")
      ) {
        return;
      }
      deletePracticeNote(entity, entityId, noteId);
    },
    [entity, entityId],
  );

  const count = notes.length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-xl border border-nyay-border bg-nyay-surface px-4 py-2.5 text-sm font-semibold text-nyay-trust shadow-sm transition-colors hover:bg-nyay-canvas/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-canvas dark:border-white/10 dark:bg-nyay-surface dark:text-foreground dark:hover:bg-nyay-trust/10 dark:focus-visible:ring-offset-[#0c1524]"
      >
        Practice notes
        {count > 0 ? (
          <span className="rounded-full bg-nyay-authority/15 px-2 py-0.5 text-xs font-bold tabular-nums text-nyay-authority-fg dark:bg-nyay-authority/25 dark:text-nyay-authority">
            {count}
          </span>
        ) : null}
      </button>

      <AppModal
        open={open}
        onOpenChange={setOpen}
        title="Practice notes"
        description={`Private reminders for this ${entity}. Saved only in this browser.`}
      >
        <div>
          <label htmlFor={`${fieldId}-input`} className="sr-only">
            New note
          </label>
          <textarea
            id={`${fieldId}-input`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Add a note…"
            className="w-full resize-y rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust placeholder:text-nyay-muted/60 focus:border-nyay-trust-mid focus:outline-none focus:ring-2 focus:ring-nyay-authority/30 dark:bg-nyay-canvas dark:text-foreground"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!draft.trim()}
              className="rounded-lg bg-nyay-trust px-4 py-2 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 transition-all hover:bg-nyay-trust-mid hover:shadow-lg hover:shadow-nyay-trust/25 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority focus-visible:ring-offset-2 focus-visible:ring-offset-nyay-surface dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft dark:focus-visible:ring-offset-[#122238]"
            >
              Add note
            </button>
          </div>
        </div>

        {notes.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-nyay-border/80 bg-nyay-canvas/50 px-4 py-8 text-center text-sm text-nyay-muted dark:bg-nyay-trust/5">
            No notes yet.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-nyay-border/90 bg-nyay-canvas/40 p-4 dark:bg-nyay-trust/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <time
                    dateTime={n.createdAt}
                    className="shrink-0 text-xs font-semibold tabular-nums text-nyay-authority-rich dark:text-nyay-authority"
                  >
                    {formatNoteWhen(n.createdAt)}
                  </time>
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
      </AppModal>
    </div>
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
  });
}
