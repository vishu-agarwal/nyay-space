import {
  notifyNyayStorageChanged,
  NYAY_CASE_NOTES_KEY,
  NYAY_CLIENT_NOTES_KEY,
} from "./nyay-storage-events";

export type PracticeNote = {
  id: string;
  /** ISO 8601 */
  createdAt: string;
  body: string;
  /** Present when saved as a hearing note (case entity only). */
  context?: "hearing";
};

export type NotesEntity = "case" | "client";

type NotesMap = Record<string, PracticeNote[]>;

function storageKey(entity: NotesEntity): string {
  return entity === "case" ? NYAY_CASE_NOTES_KEY : NYAY_CLIENT_NOTES_KEY;
}

function isPracticeNote(x: unknown): x is PracticeNote {
  if (x === null || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.createdAt !== "string" ||
    typeof o.body !== "string"
  ) {
    return false;
  }
  if (o.context !== undefined && o.context !== "hearing") return false;
  return true;
}

export function parseNotesMap(raw: string | null): NotesMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: NotesMap = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k !== "string" || !Array.isArray(v)) continue;
      const notes = v.filter(isPracticeNote);
      if (notes.length > 0) out[k] = notes;
    }
    return out;
  } catch {
    return {};
  }
}

export function loadNotesMap(entity: NotesEntity): NotesMap {
  if (typeof window === "undefined") return {};
  return parseNotesMap(window.localStorage.getItem(storageKey(entity)));
}

export function notesForEntity(entity: NotesEntity, entityId: string): PracticeNote[] {
  const map = loadNotesMap(entity);
  return [...(map[entityId] ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function saveNotesMap(entity: NotesEntity, map: NotesMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(entity), JSON.stringify(map));
  notifyNyayStorageChanged();
}

function newNoteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addPracticeNote(
  entity: NotesEntity,
  entityId: string,
  body: string,
  opts?: { context?: "hearing" },
): void {
  const trimmed = body.trim();
  if (!trimmed) return;
  const map = loadNotesMap(entity);
  const list = map[entityId] ?? [];
  const note: PracticeNote = {
    id: newNoteId(),
    createdAt: new Date().toISOString(),
    body: trimmed,
    ...(entity === "case" && opts?.context === "hearing" ? { context: "hearing" as const } : {}),
  };
  map[entityId] = [note, ...list];
  saveNotesMap(entity, map);
}

export function deletePracticeNote(
  entity: NotesEntity,
  entityId: string,
  noteId: string,
): void {
  const map = loadNotesMap(entity);
  const list = map[entityId];
  if (!list) return;
  const next = list.filter((n) => n.id !== noteId);
  if (next.length === 0) delete map[entityId];
  else map[entityId] = next;
  saveNotesMap(entity, map);
}
