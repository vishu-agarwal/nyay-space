import type { CalendarWorkItem, CalendarWorkKind } from "./calendar-reminders";
import { notifyNyayStorageChanged } from "./nyay-storage-events";

export const NYAY_CALENDAR_CUSTOM_EVENTS_KEY = "nyay-calendar-custom-events";

const CALENDAR_KINDS = new Set<CalendarWorkKind>(["hearing", "deadline", "mediation", "meeting"]);

export function loadCustomCalendarEvents(): CalendarWorkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NYAY_CALENDAR_CUSTOM_EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row): row is CalendarWorkItem => {
      if (typeof row !== "object" || row === null) return false;
      const r = row as CalendarWorkItem;
      return (
        typeof r.id === "string" &&
        r.id.startsWith("ce-") &&
        typeof r.date === "string" &&
        typeof r.title === "string" &&
        typeof r.caseId === "string" &&
        CALENDAR_KINDS.has(r.kind)
      );
    });
  } catch {
    return [];
  }
}

export function saveCustomCalendarEvents(items: CalendarWorkItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NYAY_CALENDAR_CUSTOM_EVENTS_KEY, JSON.stringify(items));
  notifyNyayStorageChanged();
}

/** Seed diary items plus validated user-created calendar entries. */
export function loadExtendedCalendarWorkItems(
  getSeedItems: () => CalendarWorkItem[],
): CalendarWorkItem[] {
  const items = [...getSeedItems(), ...loadCustomCalendarEvents()];
  items.sort((a, b) => {
    const c = a.date.localeCompare(b.date);
    if (c !== 0) return c;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
  return items;
}
