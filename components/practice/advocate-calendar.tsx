"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { MaskIcon } from "@/components/icons/mask-icon";
import { AppModal } from "@/components/ui/app-modal";
import {
  calendarWorkByDate,
  formatMonthTitle,
  getCalendarWorkItems,
  getMonthGrid,
  localISODate,
  relativeDayLabel,
  type CalendarWorkItem,
  type CalendarWorkKind,
  workItemHref,
} from "@/lib/calendar-reminders";
import { routes } from "@/lib/routes";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const REMINDER_STORAGE_KEY = "nyay-calendar-reminder-ids";
const REMINDER_PREFS_STORAGE_KEY = "nyay-calendar-reminder-prefs";
const ALERT_NOTIFICATIONS_ENABLED_KEY = "nyay-calendar-alert-notifications-enabled";
const CUSTOM_EVENTS_STORAGE_KEY = "nyay-calendar-custom-events";

const kindDotClass: Record<CalendarWorkKind, string> = {
  hearing: "bg-nyay-trust-mid dark:bg-nyay-trust-soft",
  deadline: "bg-nyay-authority",
  mediation: "bg-violet-500 dark:bg-violet-400",
  meeting: "bg-emerald-600 dark:bg-emerald-400",
};

const kindLabel: Record<CalendarWorkKind, string> = {
  hearing: "Hearing",
  deadline: "Deadline",
  mediation: "Mediation",
  meeting: "Meeting",
};

function formatISODateLong(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  if (!y || !mo || !d) return iso;
  return new Date(y, mo - 1, d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function loadReminderIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function saveReminderIds(ids: Set<string>) {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify([...ids]));
}

type ReminderLead = "on-day" | "1-day" | "2-day";
type ToastItem = { id: string; title: string; message: string };

function loadReminderPrefs(): Record<string, ReminderLead> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REMINDER_PREFS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, ReminderLead> = {};
    for (const [id, lead] of Object.entries(parsed as Record<string, unknown>)) {
      if (lead === "on-day" || lead === "1-day" || lead === "2-day") {
        out[id] = lead;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function saveReminderPrefs(prefs: Record<string, ReminderLead>) {
  localStorage.setItem(REMINDER_PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

function loadAlertNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(ALERT_NOTIFICATIONS_ENABLED_KEY);
  if (raw == null) return true;
  return raw === "1";
}

function saveAlertNotificationsEnabled(enabled: boolean) {
  localStorage.setItem(ALERT_NOTIFICATIONS_ENABLED_KEY, enabled ? "1" : "0");
}

function leadToDays(lead: ReminderLead): number {
  if (lead === "2-day") return 2;
  if (lead === "1-day") return 1;
  return 0;
}

function leadLabel(lead: ReminderLead): string {
  if (lead === "2-day") return "Alert 2 days before";
  if (lead === "1-day") return "Alert 1 day before";
  return "Alert on hearing day";
}

const CALENDAR_KINDS = new Set<CalendarWorkKind>(["hearing", "deadline", "mediation", "meeting"]);

function loadCustomEvents(): CalendarWorkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_STORAGE_KEY);
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

function saveCustomEvents(items: CalendarWorkItem[]) {
  localStorage.setItem(CUSTOM_EVENTS_STORAGE_KEY, JSON.stringify(items));
}

function orderedKindsForDay(items: CalendarWorkItem[] | undefined): CalendarWorkKind[] {
  if (!items?.length) return [];
  const order: CalendarWorkKind[] = ["hearing", "deadline", "mediation", "meeting"];
  const seen = new Set<CalendarWorkKind>();
  for (const it of items) seen.add(it.kind);
  return order.filter((k) => seen.has(k));
}

function shiftMonth(year: number, monthIndex: number, delta: number) {
  const d = new Date(year, monthIndex + delta, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
}

function parseISOParts(iso: string): { y: number; m: number; d: number } | null {
  const [y, mo, d] = iso.split("-").map(Number);
  if (!y || !mo || !d) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, m: mo - 1, d };
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Convert `<input type="time" />` value (HH:mm) to display like the rest of the diary (en-IN 12h). */
function formatTimeFromTimeInput(hm: string): string {
  const t = hm.trim();
  if (!t) return "";
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(t);
  if (!m) return t;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return t;
  const d = new Date(2000, 0, 1, h, min);
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isoDayDiff(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + "T12:00:00").getTime();
  const to = new Date(toIso + "T12:00:00").getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function DayHoverTasks({
  id,
  cellDate,
  items,
}: {
  id?: string;
  cellDate: string;
  items: CalendarWorkItem[] | undefined;
}) {
  if (!items?.length) return null;
  return (
    <div
      id={id}
      role="tooltip"
      className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 hidden max-h-[min(14rem,45vh)] w-[min(15rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-md border border-nyay-border bg-nyay-surface px-2 py-1.5 text-left text-[11px] nyay-card-shadow shadow-lg [scrollbar-gutter:stable] peer-hover:block peer-focus-visible:block dark:bg-nyay-canvas"
    >
      <p className="mb-1 border-b border-nyay-border pb-0.5 text-[11px] font-semibold text-nyay-trust dark:text-foreground">
        {formatISODateLong(cellDate)}
      </p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.id} className="leading-snug">
            <span className={`mr-1 inline-block size-1.5 shrink-0 rounded-full align-middle ${kindDotClass[it.kind]}`} />
            <span className="font-medium text-nyay-trust dark:text-foreground">{it.title}</span>
            {it.time ? (
              <span className="mt-0.5 block pl-2.5 text-[10px] tabular-nums text-nyay-muted">
                {it.time} · {kindLabel[it.kind]}
              </span>
            ) : (
              <span className="mt-0.5 block pl-2.5 text-[10px] text-nyay-muted">{kindLabel[it.kind]}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorkListRow({
  item,
  todayKey,
  reminderOn,
  reminderLead,
  onToggleReminder,
  onChangeReminderLead,
}: {
  item: CalendarWorkItem;
  todayKey: string;
  reminderOn: boolean;
  reminderLead: ReminderLead;
  onToggleReminder: (id: string) => void;
  onChangeReminderLead: (id: string, lead: ReminderLead) => void;
}) {
  const rel = relativeDayLabel(item.date, todayKey);
  const href = workItemHref(item);
  const sub =
    item.kind === "deadline"
      ? item.priority === "high"
        ? "High priority filing"
        : "Filing / task"
      : item.court ?? item.venue ?? null;

  return (
    <li className="flex gap-2 rounded-lg border border-nyay-border bg-nyay-surface py-0.5 pl-0.5 pr-2 nyay-card-shadow transition-colors hover:border-nyay-authority/40">
      <Link
        href={href}
        className="group flex min-w-0 flex-1 flex-col gap-0.5 px-2 py-2"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white ${kindDotClass[item.kind]}`}
          >
            {kindLabel[item.kind]}
          </span>
          {item.time ? (
            <span className="text-[11px] font-semibold tabular-nums text-nyay-authority-rich dark:text-nyay-authority">
              {item.time}
            </span>
          ) : null}
          {rel ? <span className="text-[11px] text-nyay-muted">{rel}</span> : null}
        </div>
        <p className="text-sm font-medium leading-snug text-nyay-trust group-hover:text-nyay-trust-mid dark:text-foreground dark:group-hover:text-foreground">
          {item.title}
        </p>
        <p className="font-mono text-[11px] leading-tight text-nyay-authority-rich dark:text-nyay-authority">
          {item.id.startsWith("ce-") && (!item.caseId || item.caseId === "—")
            ? "Unassigned"
            : item.caseId}
        </p>
        {sub ? <p className="text-[11px] leading-tight text-nyay-muted">{sub}</p> : null}
      </Link>
      <div className="flex shrink-0 flex-col justify-center py-1 pl-0.5">
        {reminderOn ? (
          <label className="mb-1 block text-[10px] text-nyay-muted">
            <span className="sr-only">Alert timing for {item.title}</span>
            <select
              value={reminderLead}
              onChange={(e) => onChangeReminderLead(item.id, e.target.value as ReminderLead)}
              className="rounded border border-nyay-border bg-nyay-surface px-1 py-0.5 text-[10px] text-nyay-trust focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/25 dark:bg-white/5 dark:text-foreground"
              aria-label={`Alert timing for ${item.title}`}
            >
              <option value="on-day">On day</option>
              <option value="1-day">1 day before</option>
              <option value="2-day">2 days before</option>
            </select>
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => onToggleReminder(item.id)}
          title={reminderOn ? "Reminder on — click to clear" : "Set reminder"}
          className={`flex size-8 items-center justify-center rounded-md border transition-colors ${
            reminderOn
              ? "border-nyay-authority bg-nyay-authority-soft text-nyay-authority-rich dark:text-nyay-authority"
              : "border-nyay-border text-nyay-muted hover:border-nyay-authority/50 hover:text-nyay-trust dark:hover:text-foreground"
          }`}
          aria-pressed={reminderOn}
          aria-label={reminderOn ? "Remove reminder" : "Set reminder"}
        >
          <MaskIcon name="bell" className="size-4" />
        </button>
      </div>
    </li>
  );
}

export function AdvocateCalendar() {
  const [todayKey] = useState(() => localISODate(new Date()));
  const [tomorrowKey] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return localISODate(d);
  });
  const [selectedISO, setSelectedISO] = useState(() => localISODate(new Date()));
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [reminderIds, setReminderIds] = useState<Set<string>>(() => new Set());
  const [reminderPrefs, setReminderPrefs] = useState<Record<string, ReminderLead>>({});
  const [customEvents, setCustomEvents] = useState<CalendarWorkItem[]>([]);
  const [focusView, setFocusView] = useState<"today" | "tomorrow">("today");
  const [alertNotificationsEnabled, setAlertNotificationsEnabled] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifiedAlertKeys, setNotifiedAlertKeys] = useState<Set<string>>(() => new Set());
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addEventDate, setAddEventDate] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventKind, setEventKind] = useState<CalendarWorkKind>("meeting");
  const [eventTime, setEventTime] = useState("");
  const [eventCaseId, setEventCaseId] = useState("");

  // Reminders live in localStorage; read after mount so server HTML matches first client paint.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted reminder IDs once on client
    setReminderIds(loadReminderIds());
    setReminderPrefs(loadReminderPrefs());
    setAlertNotificationsEnabled(loadAlertNotificationsEnabled());
    setCustomEvents(loadCustomEvents());
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveReminderIds(next);
      return next;
    });
    setReminderPrefs((prev) => {
      const next = { ...prev };
      if (id in next) {
        delete next[id];
      } else {
        next[id] = "1-day";
      }
      saveReminderPrefs(next);
      return next;
    });
  }, []);

  const changeReminderLead = useCallback((id: string, lead: ReminderLead) => {
    setReminderPrefs((prev) => {
      const next = { ...prev, [id]: lead };
      saveReminderPrefs(next);
      return next;
    });
  }, []);

  const allItems = useMemo(() => {
    const base = getCalendarWorkItems();
    const merged = [...base, ...customEvents];
    merged.sort((a, b) => {
      const c = a.date.localeCompare(b.date);
      if (c !== 0) return c;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
    return merged;
  }, [customEvents]);
  const byDate = useMemo(() => calendarWorkByDate(allItems), [allItems]);
  const grid = useMemo(() => getMonthGrid(cursor.y, cursor.m), [cursor.y, cursor.m]);

  const todayItems = useMemo(() => {
    if (!todayKey) return [];
    return byDate.get(todayKey) ?? [];
  }, [byDate, todayKey]);

  const selectedItems = useMemo(() => {
    if (!selectedISO) return [];
    return byDate.get(selectedISO) ?? [];
  }, [byDate, selectedISO]);

  const tomorrowItems = useMemo(() => byDate.get(tomorrowKey) ?? [], [byDate, tomorrowKey]);

  const focusItems = focusView === "today" ? todayItems : tomorrowItems;
  const focusDate = focusView === "today" ? todayKey : tomorrowKey;

  const upcomingItems = useMemo(() => {
    if (!todayKey) return [];
    return allItems.filter((it) => it.date > todayKey).slice(0, 10);
  }, [allItems, todayKey]);

  const pastItems = useMemo(() => {
    if (!todayKey) return [];
    return allItems
      .filter((it) => it.date < todayKey)
      .slice(-8)
      .reverse();
  }, [allItems, todayKey]);

  const goToday = useCallback(() => {
    const d = new Date();
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelectedISO(localISODate(d));
  }, []);

  const applyJumpDate = useCallback((y: number, m: number, d: number) => {
    const maxD = daysInMonth(y, m);
    const dayClamped = Math.min(Math.max(1, d), maxD);
    setCursor({ y, m });
    setSelectedISO(localISODate(new Date(y, m, dayClamped)));
  }, []);

  const jumpParts = parseISOParts(selectedISO);
  const jumpY = jumpParts?.y ?? cursor.y;
  const jumpM = jumpParts?.m ?? cursor.m;
  const jumpD = jumpParts?.d ?? 1;

  const yearOptions = useMemo(() => {
    const cy = new Date().getFullYear();
    const lo = Math.min(cy - 8, cursor.y - 2, jumpY);
    const hi = Math.max(cy + 6, cursor.y + 6, jumpY);
    const years: number[] = [];
    for (let y = lo; y <= hi; y++) years.push(y);
    return years;
  }, [cursor.y, jumpY]);

  const selectedHeading =
    selectedISO === todayKey ? "Today's schedule" : formatISODateLong(selectedISO);

  const upcomingAlertItems = useMemo(() => {
    return allItems
      .filter((it) => it.kind === "hearing" && reminderIds.has(it.id))
      .map((it) => {
        const lead = reminderPrefs[it.id] ?? "1-day";
        const until = isoDayDiff(todayKey, it.date);
        return { item: it, lead, until };
      })
      .filter((row) => row.until >= 0 && row.until <= leadToDays(row.lead))
      .sort((a, b) => {
        const c = a.item.date.localeCompare(b.item.date);
        if (c !== 0) return c;
        return (a.item.time ?? "").localeCompare(b.item.time ?? "");
      })
      .slice(0, 8);
  }, [allItems, reminderIds, reminderPrefs, todayKey]);

  const pushToast = useCallback((title: string, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    if (!alertNotificationsEnabled) return;
    if (upcomingAlertItems.length === 0) return;

    const newDue = upcomingAlertItems.filter(
      ({ item, lead }) => !notifiedAlertKeys.has(`${item.id}:${todayKey}:${lead}`),
    );
    if (newDue.length === 0) return;

    const first = newDue[0];
    pushToast(
      "Hearing alert",
      `${first.item.title} · ${first.until === 0 ? "Today" : first.until === 1 ? "Tomorrow" : `In ${first.until} days`}`,
    );
    if (newDue.length > 1) {
      pushToast("More alerts", `${newDue.length - 1} more reminder(s) need attention.`);
    }

    setNotifiedAlertKeys((prev) => {
      const next = new Set(prev);
      for (const row of newDue) next.add(`${row.item.id}:${todayKey}:${row.lead}`);
      return next;
    });
  }, [alertNotificationsEnabled, notifiedAlertKeys, pushToast, todayKey, upcomingAlertItems]);

  const dayHasReminder = useCallback(
    (iso: string) => {
      const list = byDate.get(iso);
      if (!list) return false;
      return list.some((it) => reminderIds.has(it.id));
    },
    [byDate, reminderIds],
  );

  const handleDayClick = useCallback((iso: string) => {
    setSelectedISO(iso);
    setAddEventDate(iso);
    setEventTitle("");
    setEventKind("meeting");
    setEventTime("");
    setEventCaseId("");
    setAddEventOpen(true);
  }, []);

  const submitAddEvent = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!addEventDate || !eventTitle.trim()) return;
      const id = `ce-${Date.now()}`;
      const newItem: CalendarWorkItem = {
        id,
        kind: eventKind,
        date: addEventDate,
        time: eventTime.trim() ? formatTimeFromTimeInput(eventTime) : undefined,
        title: eventTitle.trim(),
        caseId: eventCaseId.trim() || "—",
        ...(eventKind === "deadline" ? { priority: "normal" as const } : {}),
      };
      setCustomEvents((prev) => {
        const next = [...prev, newItem];
        saveCustomEvents(next);
        return next;
      });
      setAddEventOpen(false);
      setAddEventDate(null);
    },
    [addEventDate, eventCaseId, eventKind, eventTime, eventTitle],
  );

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-x-4 lg:gap-y-0">
      <aside className="order-1 min-h-0 w-full min-w-0 space-y-2 sm:space-y-3">
        <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:items-stretch sm:gap-3">
          <section
            aria-labelledby="today-diary-heading"
            className="flex min-h-0 min-w-0 flex-col rounded-lg border border-nyay-border bg-nyay-surface p-2.5 nyay-card-shadow"
          >
            <div className="flex shrink-0 flex-wrap items-baseline justify-between gap-2">
              <h2
                id="today-diary-heading"
                className="text-base font-semibold text-nyay-trust dark:text-foreground"
              >
                Today / Tomorrow
              </h2>
              <div className="inline-flex items-center rounded-md border border-nyay-border bg-nyay-canvas/50 p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFocusView("today")}
                  aria-pressed={focusView === "today"}
                  className={[
                    "rounded px-2 py-0.5 font-medium transition-colors",
                    focusView === "today"
                      ? "bg-nyay-authority-soft text-nyay-authority-rich dark:text-nyay-authority"
                      : "text-nyay-muted hover:text-nyay-trust dark:hover:text-foreground",
                  ].join(" ")}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setFocusView("tomorrow")}
                  aria-pressed={focusView === "tomorrow"}
                  className={[
                    "rounded px-2 py-0.5 font-medium transition-colors",
                    focusView === "tomorrow"
                      ? "bg-nyay-authority-soft text-nyay-authority-rich dark:text-nyay-authority"
                      : "text-nyay-muted hover:text-nyay-trust dark:hover:text-foreground",
                  ].join(" ")}
                >
                  Tomorrow
                </button>
              </div>
            </div>
            <time className="mt-1 block text-[11px] font-medium tabular-nums text-nyay-muted" dateTime={focusDate}>
              {formatISODateLong(focusDate)}
            </time>
            {focusItems.length === 0 ? (
              <p className="mt-2 shrink-0 text-xs leading-relaxed text-nyay-muted">
                {focusView === "today"
                  ? "Nothing scheduled for today in the loaded diary. Select another date on the calendar or add hearings and tasks to your matters."
                  : "Nothing scheduled for tomorrow. This is a good slot for drafting, research, or client follow-ups."}
              </p>
            ) : (
              <ul
                className="mt-2 min-h-0 max-h-[16.75rem] space-y-1.5 overflow-y-auto overscroll-y-contain pr-0.5 [scrollbar-gutter:stable] sm:max-h-[min(16.75rem,50vh)]"
                aria-label="Today entries, scroll for more"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {focusItems.map((item) => (
                  <WorkListRow
                    key={item.id}
                    item={item}
                    todayKey={todayKey}
                    reminderOn={reminderIds.has(item.id)}
                    reminderLead={reminderPrefs[item.id] ?? "1-day"}
                    onToggleReminder={toggleReminder}
                    onChangeReminderLead={changeReminderLead}
                  />
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="selected-day-heading"
            className="flex min-h-0 min-w-0 flex-col rounded-lg border border-nyay-border bg-nyay-surface p-2.5 nyay-card-shadow"
          >
            <h2
              id="selected-day-heading"
              className="shrink-0 text-base font-semibold leading-tight text-nyay-trust dark:text-foreground"
            >
              {selectedHeading}
            </h2>
            {selectedISO === todayKey ? (
              <p className="mt-0.5 shrink-0 text-[11px] leading-snug text-nyay-muted">
                Same list as left — tap a calendar day to review another date.
              </p>
            ) : null}
            {selectedISO === todayKey ? null : selectedItems.length === 0 ? (
              <p className="mt-2 shrink-0 text-xs text-nyay-muted">No diary entries on this date.</p>
            ) : (
              <ul
                className="mt-2 min-h-0 max-h-[16.75rem] space-y-1.5 overflow-y-auto overscroll-y-contain pr-0.5 [scrollbar-gutter:stable] sm:max-h-[min(16.75rem,50vh)]"
                aria-label="Selected day entries"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {selectedItems.map((item) => (
                  <WorkListRow
                    key={item.id}
                    item={item}
                    todayKey={todayKey || selectedISO}
                    reminderOn={reminderIds.has(item.id)}
                    reminderLead={reminderPrefs[item.id] ?? "1-day"}
                    onToggleReminder={toggleReminder}
                    onChangeReminderLead={changeReminderLead}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>

        <div
          className="grid min-h-0 grid-cols-1 gap-2.5 sm:h-80 sm:grid-cols-2 sm:items-stretch sm:gap-3"
          aria-label="Upcoming and recent entries"
        >
          <section
            aria-labelledby="upcoming-heading"
            className="isolate flex max-h-52 min-h-[11rem] flex-col overflow-hidden rounded-lg border border-nyay-border bg-nyay-surface p-2.5 nyay-card-shadow sm:max-h-none sm:h-full sm:min-h-0"
          >
            <h2
              id="upcoming-heading"
              className="mb-2 flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-nyay-muted"
            >
              <span className="h-px flex-1 bg-nyay-border" aria-hidden />
              Upcoming
              <span className="h-px flex-1 bg-nyay-border" aria-hidden />
            </h2>
            <ul
              className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-0.5 [scrollbar-gutter:stable]"
              aria-label="Upcoming entries, scroll independently"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {upcomingItems.length === 0 ? (
                <li className="text-[11px] text-nyay-muted">No future entries.</li>
              ) : (
                upcomingItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={workItemHref(item)}
                      className="flex flex-col rounded-md border border-transparent px-1 py-1 text-xs transition-colors hover:border-nyay-border hover:bg-nyay-canvas dark:hover:bg-nyay-trust/10"
                    >
                      <span className="font-medium leading-snug text-nyay-trust dark:text-foreground">
                        {item.title}
                      </span>
                      <span className="text-[11px] leading-tight text-nyay-muted">
                        {formatISODateLong(item.date)}
                        {item.time ? ` · ${item.time}` : ""}
                        {" · "}
                        <span className="font-mono text-nyay-authority-rich dark:text-nyay-authority">
                          {item.caseId}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section
            aria-labelledby="past-heading"
            className="isolate flex max-h-52 min-h-[11rem] flex-col overflow-hidden rounded-lg border border-nyay-border bg-nyay-surface p-2.5 nyay-card-shadow sm:max-h-none sm:h-full sm:min-h-0"
          >
            <h2
              id="past-heading"
              className="mb-2 flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-nyay-muted"
            >
              <span className="h-px flex-1 bg-nyay-border" aria-hidden />
              Recent past
              <span className="h-px flex-1 bg-nyay-border" aria-hidden />
            </h2>
            <ul
              className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-0.5 [scrollbar-gutter:stable]"
              aria-label="Recent past entries, scroll independently"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {pastItems.length === 0 ? (
                <li className="text-[11px] text-nyay-muted">No earlier entries in the loaded data.</li>
              ) : (
                pastItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={workItemHref(item)}
                      className="flex flex-col rounded-md border border-transparent px-1 py-1 text-xs transition-colors hover:border-nyay-border hover:bg-nyay-canvas dark:hover:bg-nyay-trust/10"
                    >
                      <span className="font-medium leading-snug text-nyay-trust dark:text-foreground">
                        {item.title}
                      </span>
                      <span className="text-[11px] leading-tight text-nyay-muted">
                        {formatISODateLong(item.date)}
                        {item.time ? ` · ${item.time}` : ""}
                        {" · "}
                        <span className="font-mono text-nyay-authority-rich dark:text-nyay-authority">
                          {item.caseId}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <p className="text-[11px] leading-snug text-nyay-muted">
          Reminders and added events are stored in this browser only. Diary rows with a case ID
          open that matter; timeline links scroll to the event when present.
        </p>
        <section
          aria-labelledby="alerts-heading"
          className="rounded-lg border border-nyay-border bg-nyay-surface p-2.5 nyay-card-shadow"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="alerts-heading" className="text-sm font-semibold text-nyay-trust dark:text-foreground">
              Alerts before hearing
            </h2>
            <button
              type="button"
              onClick={() =>
                setAlertNotificationsEnabled((prev) => {
                  const next = !prev;
                  saveAlertNotificationsEnabled(next);
                  return next;
                })
              }
              title={alertNotificationsEnabled ? "Pause alert popups" : "Enable alert popups"}
              aria-pressed={alertNotificationsEnabled}
              aria-label={alertNotificationsEnabled ? "Pause alert popups" : "Enable alert popups"}
              className={`inline-flex size-8 items-center justify-center rounded-md border transition-colors ${
                alertNotificationsEnabled
                  ? "border-nyay-authority bg-nyay-authority-soft text-nyay-authority-rich dark:text-nyay-authority"
                  : "border-nyay-border text-nyay-muted hover:border-nyay-authority/50 hover:text-nyay-trust dark:hover:text-foreground"
              }`}
            >
              <MaskIcon name="bell" className="size-4" />
            </button>
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-nyay-muted">
            Based on your selected alert timing for each hearing. Bell controls popup toasts.
          </p>
          <ul className="mt-2 space-y-1.5">
            {upcomingAlertItems.length === 0 ? (
              <li className="text-[11px] text-nyay-muted">
                No active hearing alerts right now. Turn on the bell for a hearing to get pre-hearing alerts.
              </li>
            ) : (
              upcomingAlertItems.map(({ item, lead, until }) => (
                <li key={`alert-${item.id}`} className="rounded-md border border-nyay-border px-2 py-1.5">
                  <p className="text-xs font-medium text-nyay-trust dark:text-foreground">{item.title}</p>
                  <p className="text-[11px] text-nyay-muted">
                    {formatISODateLong(item.date)}
                    {item.time ? ` · ${item.time}` : ""}
                    {" · "}
                    {until === 0 ? "Today" : until === 1 ? "Tomorrow" : `In ${until} days`}
                  </p>
                  <p className="text-[10px] text-nyay-authority-rich dark:text-nyay-authority">
                    {leadLabel(lead)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </aside>
      <div className="pointer-events-none fixed bottom-3 right-3 z-[70] flex w-[min(24rem,calc(100vw-1.5rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto rounded-lg border border-nyay-border bg-nyay-surface px-3 py-2 nyay-card-shadow"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 rounded-md bg-nyay-authority-soft p-1 text-nyay-authority-rich dark:text-nyay-authority">
                <MaskIcon name="bell" className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-nyay-trust dark:text-foreground">{t.title}</p>
                <p className="text-[11px] leading-snug text-nyay-muted">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="rounded px-1 text-[11px] text-nyay-muted hover:text-nyay-trust dark:hover:text-foreground"
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="order-2 mx-auto flex w-full max-w-[20 rem] shrink-0 flex-col gap-2 lg:sticky lg:top-6 lg:mx-0 lg:self-start">
        <div
          className="rounded-lg border border-nyay-border bg-nyay-surface p-2.5 nyay-card-shadow"
          aria-labelledby="jump-date-heading"
        >
          <h3
            id="jump-date-heading"
            className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-nyay-muted"
          >
            Go to date
          </h3>
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="flex min-w-0 flex-col gap-0.5 text-[11px] font-medium text-nyay-trust dark:text-foreground">
              <span className="text-nyay-muted">Date</span>
              <input
                type="date"
                value={selectedISO}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const p = parseISOParts(v);
                  if (p) applyJumpDate(p.y, p.m, p.d);
                }}
                className="w-full min-w-0 rounded border border-nyay-border bg-nyay-canvas/40 px-1.5 py-1 text-[11px] text-nyay-trust tabular-nums focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/30 dark:bg-white/5 dark:text-foreground"
              />
            </label>
            <div className="flex flex-wrap items-end gap-1.5">
              <label className="flex flex-col gap-0.5 text-[11px] font-medium text-nyay-trust dark:text-foreground">
                <span className="text-nyay-muted">Year</span>
                <select
                  value={jumpY}
                  onChange={(e) => applyJumpDate(Number(e.target.value), jumpM, jumpD)}
                  className="min-w-[3.75rem] rounded border border-nyay-border bg-nyay-canvas/40 px-1.5 py-1 text-[11px] tabular-nums focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/30 dark:bg-white/5 dark:text-foreground"
                  aria-label="Year"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-0 flex-1 flex-col gap-0.5 text-[11px] font-medium text-nyay-trust dark:text-foreground">
                <span className="text-nyay-muted">Month</span>
                <select
                  value={jumpM}
                  onChange={(e) => applyJumpDate(jumpY, Number(e.target.value), jumpD)}
                  className="w-full min-w-0 rounded border border-nyay-border bg-nyay-canvas/40 px-1.5 py-1 text-[11px] focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/30 dark:bg-white/5 dark:text-foreground"
                  aria-label="Month"
                >
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name.slice(0, 3)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-0.5 text-[11px] font-medium text-nyay-trust dark:text-foreground">
                <span className="text-nyay-muted">Day</span>
                <select
                  value={jumpD}
                  onChange={(e) => applyJumpDate(jumpY, jumpM, Number(e.target.value))}
                  className="min-w-[2.75rem] rounded border border-nyay-border bg-nyay-canvas/40 px-1.5 py-1 text-[11px] tabular-nums focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/30 dark:bg-white/5 dark:text-foreground"
                  aria-label="Day"
                >
                  {Array.from({ length: daysInMonth(jumpY, jumpM) }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <section  
          aria-labelledby="month-calendar-heading"
          className="w-full overflow-visible rounded-lg border border-nyay-border bg-nyay-surface p-2 nyay-card-shadow"
        >
        <div className="mb-1.5 flex items-center justify-between gap-1">
          <h2
            id="month-calendar-heading"
            className="min-w-0 truncate text-xs font-semibold text-nyay-trust dark:text-foreground"
          >
            {formatMonthTitle(cursor.y, cursor.m)}
          </h2>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => setCursor((c) => shiftMonth(c.y, c.m, -1))}
              title="Previous month"
              aria-label="Previous month"
              className="inline-flex size-5.5 items-center justify-center rounded border border-nyay-border text-nyay-trust transition-colors hover:bg-nyay-canvas dark:text-foreground dark:hover:bg-nyay-trust/10"
            >
              <MaskIcon name="chevron-left" className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={goToday}
              title="Jump to today"
              aria-label="Jump to today"
              className="rounded border border-nyay-authority/50 bg-nyay-authority-soft px-1.5 py-0.5 text-[10px] font-semibold text-nyay-authority-rich dark:text-nyay-authority"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setCursor((c) => shiftMonth(c.y, c.m, 1))}
              title="Next month"
              aria-label="Next month"
              className="inline-flex size-5.5 items-center justify-center rounded border border-nyay-border text-nyay-trust transition-colors hover:bg-nyay-canvas dark:text-foreground dark:hover:bg-nyay-trust/10"
            >
              <MaskIcon name="chevron-right" className="size-3.5" />
            </button>
          </div>
        </div>

        <p className="mb-1 text-[9px] leading-tight text-nyay-muted">
          Tap a day to add an event or view it in the diary.
        </p>

        <div
          className="grid grid-cols-7 gap-px text-center text-[10px] font-medium text-nyay-muted"
          role="rowgroup"
        >
          {weekdayLabels.map((w) => (
            <div key={w} className="py-1" role="columnheader">
              {w.slice(0, 1)}
            </div>
          ))}
        </div>
        <div
          className="mt-px grid grid-cols-7 gap-px overflow-visible text-xs"
          role="grid"
          aria-label={`Calendar for ${formatMonthTitle(cursor.y, cursor.m)}`}
        >
          {grid.map((cell) => {
            const bucket = byDate.get(cell.date);
            const kinds = orderedKindsForDay(bucket);
            const isToday = cell.date === todayKey;
            const isSelected = selectedISO === cell.date;
            const reminderDay = dayHasReminder(cell.date);
            const hasTasks = (bucket?.length ?? 0) > 0;

            return (
              <div
                key={`${cell.date}-${cell.day}-${cell.isCurrentMonth}`}
                className="relative flex min-h-8 justify-center"
              >
                <button
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-describedby={hasTasks ? `cal-tip-${cell.date}` : undefined}
                  onClick={() => handleDayClick(cell.date)}
                  className={[
                    "peer relative z-10 flex w-full min-w-0 flex-col items-center justify-start rounded-md border py-0.5 transition-colors",
                    cell.isCurrentMonth
                      ? "text-nyay-trust dark:text-foreground"
                      : "text-nyay-muted/40",
                    isSelected
                      ? "border-nyay-authority ring-1 ring-nyay-authority/50 ring-offset-1 ring-offset-nyay-surface dark:ring-offset-nyay-surface"
                      : "border-transparent",
                    isToday && !isSelected
                      ? "border-nyay-authority/40 bg-nyay-authority-soft/60"
                      : "",
                    !isSelected && cell.isCurrentMonth
                      ? "hover:bg-nyay-canvas dark:hover:bg-nyay-trust/10"
                      : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "tabular-nums leading-none",
                      isToday ? "font-semibold text-nyay-authority-rich dark:text-nyay-authority" : "",
                    ].join(" ")}
                  >
                    {cell.day}
                  </span>
                  <span className="mt-px flex min-h-[5px] flex-wrap justify-center gap-px" aria-hidden>
                    {kinds.map((k) => (
                      <span key={k} className={`size-1 rounded-full ${kindDotClass[k]}`} />
                    ))}
                  </span>
                  {reminderDay ? (
                    <span
                      className="mt-px h-1 w-1 rounded-full bg-nyay-authority-rich dark:bg-nyay-authority"
                      title="Reminder set for an item on this day"
                      aria-hidden
                    />
                  ) : null}
                </button>
                {hasTasks ? (
                  <DayHoverTasks
                    id={`cal-tip-${cell.date}`}
                    cellDate={cell.date}
                    items={bucket}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-1.5 flex max-w-full flex-wrap gap-x-1.5 gap-y-0.5 overflow-x-auto overscroll-x-contain border-t border-nyay-border pt-1.5 text-[9px] text-nyay-muted">
          {(Object.keys(kindLabel) as CalendarWorkKind[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1">
              <span className={`size-1 rounded-full ${kindDotClass[k]}`} />
              {kindLabel[k]}
            </span>
          ))}
          <span className="inline-flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-nyay-authority-rich dark:bg-nyay-authority" />
            Reminder
          </span>
        </div>
        </section>
      </div>

      <AppModal
        open={addEventOpen}
        onOpenChange={(open) => {
          setAddEventOpen(open);
          if (!open) setAddEventDate(null);
        }}
        title={addEventDate ? `Add event · ${formatISODateLong(addEventDate)}` : "Add event"}
        description="Save to your local diary. Use a case ID (e.g. CV-2025-02) to link to a matter, or leave it blank."
        footer={
          <div className="flex flex-wrap justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAddEventOpen(false);
                setAddEventDate(null);
              }}
              className="rounded-md border border-nyay-border px-3 py-1.5 text-xs font-medium text-nyay-trust transition-colors hover:bg-nyay-canvas dark:text-foreground dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-calendar-event-form"
              className="rounded-md bg-nyay-trust px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-nyay-trust-mid dark:bg-nyay-authority dark:text-nyay-trust dark:hover:bg-nyay-authority-rich"
            >
              Save event
            </button>
          </div>
        }
      >
        <form id="add-calendar-event-form" className="space-y-2.5" onSubmit={submitAddEvent}>
          <label className="block text-xs font-medium text-nyay-trust dark:text-foreground">
            Title
            <input
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Client call, filing due"
              className="mt-0.5 w-full rounded-md border border-nyay-border bg-nyay-canvas/30 px-2.5 py-1.5 text-sm text-nyay-trust placeholder:text-nyay-muted focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/25 dark:bg-white/5 dark:text-foreground"
            />
          </label>
          <label className="block text-xs font-medium text-nyay-trust dark:text-foreground">
            Type
            <select
              value={eventKind}
              onChange={(e) => setEventKind(e.target.value as CalendarWorkKind)}
              className="mt-0.5 w-full rounded-md border border-nyay-border bg-nyay-canvas/30 px-2.5 py-1.5 text-sm focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/25 dark:bg-white/5 dark:text-foreground"
            >
              {(Object.keys(kindLabel) as CalendarWorkKind[]).map((k) => (
                <option key={k} value={k}>
                  {kindLabel[k]}
                </option>
              ))}
            </select>
          </label>
          <div className="block text-xs font-medium text-nyay-trust dark:text-foreground">
            <span>
              Time <span className="font-normal text-nyay-muted">(optional)</span>
            </span>
            <div className="relative mt-0.5">
              <span
                className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-nyay-muted"
                aria-hidden
              >
                <MaskIcon name="stat-clock" className="size-4" />
              </span>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full rounded-md border border-nyay-border bg-nyay-canvas/30 py-1.5 pl-9 pr-2.5 text-sm tabular-nums text-nyay-trust focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/25 dark:bg-white/5 dark:text-foreground"
                aria-label="Event time"
              />
            </div>
            <p className="mt-0.5 text-[11px] text-nyay-muted">
              Saved as 12-hour time in the diary.
            </p>
          </div>
          <label className="block text-xs font-medium text-nyay-trust dark:text-foreground">
            Case ID <span className="font-normal text-nyay-muted">(optional)</span>
            <input
              value={eventCaseId}
              onChange={(e) => setEventCaseId(e.target.value)}
              placeholder="e.g. CV-2025-02"
              className="mt-0.5 w-full rounded-md border border-nyay-border bg-nyay-canvas/30 px-2.5 py-1.5 font-mono text-sm text-nyay-trust placeholder:text-nyay-muted focus:border-nyay-authority focus:outline-none focus:ring-1 focus:ring-nyay-authority/25 dark:bg-white/5 dark:text-foreground"
            />
          </label>
          <p className="text-[11px] leading-snug text-nyay-muted">
            Open{" "}
            <Link
              href={routes.cases}
              className="font-medium text-nyay-authority-rich underline-offset-2 hover:underline dark:text-nyay-authority"
            >
              Cases
            </Link>{" "}
            to copy an ID. Events stay in this browser until you connect a server.
          </p>
        </form>
      </AppModal>
    </div>
  );
}
