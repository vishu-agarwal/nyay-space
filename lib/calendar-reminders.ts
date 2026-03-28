import { getCaseDetailForId, matters, type Matter } from "./cases";

export type HearingReminder = {
  id: string;
  date: string;
  time?: string;
  title: string;
  caseId: string;
  court: string;
  source: "next" | "timeline";
};

export type DeadlineReminder = {
  id: string;
  date: string;
  title: string;
  caseId: string;
  priority: "high" | "normal";
};

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function localISODate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Parses leading segment like "Mar 28, 2026 · 10:00 AM" */
export function parseCourtScheduleLine(line: string): {
  date: string;
  time?: string;
} | null {
  const trimmed = line.trim();
  const [head, ...rest] = trimmed.split("·").map((s) => s.trim());
  const time = rest.length ? rest.join(" · ") : undefined;
  const m = head.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!m) return null;
  const mon = MONTHS[m[1]];
  if (mon === undefined) return null;
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (!day || !year) return null;
  const d = new Date(year, mon, day);
  return { date: localISODate(d), time };
}

function matterTitle(m: Matter): string {
  return m.title;
}

export function getHearingReminders(): HearingReminder[] {
  const out: HearingReminder[] = [];
  for (const m of matters) {
    if (m.status !== "active") continue;
    const bundle = getCaseDetailForId(m.id);
    if (!bundle) continue;
    const { extra } = bundle;
    if (extra.nextHearing) {
      const parsed = parseCourtScheduleLine(extra.nextHearing);
      if (parsed) {
        out.push({
          id: `nh-${m.id}`,
          date: parsed.date,
          time: parsed.time,
          title: `Hearing — ${matterTitle(m)}`,
          caseId: m.id,
          court: m.court,
          source: "next",
        });
      }
    }
    for (const ev of extra.timeline) {
      if (ev.kind !== "hearing") continue;
      out.push({
        id: `tl-${m.id}-${ev.id}`,
        date: ev.date,
        time: ev.time,
        title: ev.title,
        caseId: m.id,
        court: m.court,
        source: "timeline",
      });
    }
  }
  out.sort((a, b) => {
    const c = a.date.localeCompare(b.date);
    if (c !== 0) return c;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
  return out;
}

/** Filing and task deadlines (demo seed; replace with DB later). */
export const filingDeadlines: DeadlineReminder[] = [
  {
    id: "fd-1",
    date: "2026-03-29",
    title: "Written statement due",
    caseId: "CV-2024-118",
    priority: "high",
  },
  {
    id: "fd-2",
    date: "2026-03-31",
    title: "Evidence affidavit",
    caseId: "ARB-2023-44",
    priority: "high",
  },
  {
    id: "fd-3",
    date: "2026-04-02",
    title: "Reply to counter-claim",
    caseId: "CV-2025-02",
    priority: "normal",
  },
  {
    id: "fd-4",
    date: "2026-04-05",
    title: "Mediation appearance",
    caseId: "CV-2025-02",
    priority: "normal",
  },
];

export function remindersByDate(
  hearings: HearingReminder[],
  deadlines: DeadlineReminder[],
): Map<string, { hearings: HearingReminder[]; deadlines: DeadlineReminder[] }> {
  const map = new Map<
    string,
    { hearings: HearingReminder[]; deadlines: DeadlineReminder[] }
  >();
  function bucket(iso: string) {
    let b = map.get(iso);
    if (!b) {
      b = { hearings: [], deadlines: [] };
      map.set(iso, b);
    }
    return b;
  }
  for (const h of hearings) {
    bucket(h.date).hearings.push(h);
  }
  for (const d of deadlines) {
    bucket(d.date).deadlines.push(d);
  }
  return map;
}

export type MonthCell = {
  date: string;
  day: number;
  isCurrentMonth: boolean;
};

/** Sunday = 0. Returns ISO date keys only for `isCurrentMonth` cells. */
export function getMonthGrid(year: number, monthIndex: number): MonthCell[] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();
  const cells: MonthCell[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const d = new Date(year, monthIndex - 1, day);
    cells.push({
      day,
      isCurrentMonth: false,
      date: localISODate(d),
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day);
    cells.push({
      day,
      isCurrentMonth: true,
      date: localISODate(d),
    });
  }
  const tail = 42 - cells.length;
  for (let day = 1; day <= tail; day++) {
    const d = new Date(year, monthIndex + 1, day);
    cells.push({
      day,
      isCurrentMonth: false,
      date: localISODate(d),
    });
  }
  return cells;
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}
