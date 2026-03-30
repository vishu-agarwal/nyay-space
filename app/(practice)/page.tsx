import Link from "next/link";
import {
  deadlinesInNextDays,
  filingDeadlines,
  formatISODateShort,
  getHearingReminders,
  localISODate,
} from "@/lib/calendar-reminders";
import { MaskIcon } from "@/components/icons/mask-icon";
import { routes } from "@/lib/routes";

type QuickStatIconKind = "cases" | "hearings" | "deadlines" | "onTrack";

/** Workflow emphasis for home overview rows (distinct from case lifecycle in lib/cases). */
type MatterStatusIndicator = "active" | "pending" | "urgent";

function MatterStatusBadge({ kind }: { kind: MatterStatusIndicator }) {
  const styles: Record<MatterStatusIndicator, string> = {
    active:
      "bg-emerald-500/12 text-emerald-900 ring-1 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/25",
    pending:
      "bg-nyay-canvas text-nyay-trust-mid ring-1 ring-nyay-border dark:bg-white/[0.06] dark:text-nyay-muted dark:ring-white/10",
    urgent:
      "bg-red-500/12 text-red-900 ring-1 ring-red-600/25 dark:bg-red-400/12 dark:text-red-200 dark:ring-red-400/30",
  };
  const label: Record<MatterStatusIndicator, string> = {
    active: "Active",
    pending: "Pending",
    urgent: "Urgent",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        styles[kind],
      ].join(" ")}
    >
      {label[kind]}
    </span>
  );
}

const quickStats: {
  label: string;
  value: string;
  hint: string;
  icon: QuickStatIconKind;
  iconTone: "trust" | "authority";
}[] = [
  {
    label: "Active cases",
    value: "24",
    hint: "3 added this month",
    icon: "cases",
    iconTone: "trust",
  },
  {
    label: "Hearings today",
    value: "5",
    hint: "Next at 11:00 AM",
    icon: "hearings",
    iconTone: "authority",
  },
  {
    label: "Deadlines (7 days)",
    value: "8",
    hint: "2 high priority",
    icon: "deadlines",
    iconTone: "authority",
  },
  {
    label: "Matters on track",
    value: "19",
    hint: "79% of portfolio",
    icon: "onTrack",
    iconTone: "trust",
  },
];

const quickStatIconName: Record<QuickStatIconKind, string> = {
  cases: "stat-cases",
  hearings: "stat-calendar",
  deadlines: "stat-clock",
  onTrack: "stat-check-circle",
};

function QuickStatGlyph({ kind }: { kind: QuickStatIconKind }) {
  return <MaskIcon name={quickStatIconName[kind]} className="h-6 w-6" />;
}

const activeCases: {
  id: string;
  title: string;
  client: string;
  stage: string;
  next: string;
  status: MatterStatusIndicator;
  nextFocus: string;
}[] = [
  {
    id: "CV-2025-02",
    title: "Contract dispute — supply agreement",
    client: "Northwind Traders",
    stage: "Written statements",
    next: "Apr 2",
    status: "pending",
    nextFocus: "Next step: Upload document",
  },
  {
    id: "CR-2024-881",
    title: "Bail & trial prep",
    client: "A. Khan",
    stage: "Hearing cycle",
    next: "Mar 28",
    status: "urgent",
    nextFocus: "Next hearing tomorrow",
  },
  {
    id: "ARB-2023-44",
    title: "Construction arbitration",
    client: "BuildWell LLP",
    stage: "Evidence",
    next: "Mar 31",
    status: "active",
    nextFocus: "Expert report due in 5 days",
  },
  {
    id: "CV-2024-118",
    title: "Property injunction",
    client: "S. Reddy",
    stage: "Pleadings",
    next: "Mar 29",
    status: "active",
    nextFocus: "Awaiting court notice",
  },
];

export default function DashboardPage() {
  const todayKey = localISODate(new Date());
  const hearings = getHearingReminders();
  const hearingsToday = hearings.filter((h) => h.date === todayKey);
  const hearingsTodaySorted = [...hearingsToday].sort((a, b) =>
    (a.time ?? "").localeCompare(b.time ?? ""),
  );
  const upcomingHearings = hearings.filter((h) => h.date >= todayKey).slice(0, 6);
  const deadlinesWeek = deadlinesInNextDays(filingDeadlines, todayKey, 7);
  const highPriorityWeek = deadlinesWeek.filter((d) => d.priority === "high").length;
  const upcomingDeadlines = filingDeadlines
    .filter((d) => d.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const nextToday = hearingsTodaySorted[0];
  const hearingHint = nextToday
    ? nextToday.time
      ? `Next at ${nextToday.time}`
      : `Today · ${nextToday.title.replace(/^Hearing — /, "")}`
    : "No hearings scheduled today";

  const deadlineHint =
    highPriorityWeek > 0
      ? `${highPriorityWeek} high priority`
      : deadlinesWeek.length > 0
        ? "No high-priority items"
        : "No deadlines in the next week";

  const statsWithReminders = quickStats.map((s, i) => {
    if (i === 1) {
      return {
        ...s,
        value: String(hearingsToday.length),
        hint: hearingHint,
      };
    }
    if (i === 2) {
      return {
        ...s,
        value: String(deadlinesWeek.length),
        hint: deadlineHint,
      };
    }
    return s;
  });

  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-7xl nyay-page-y">
        <header className="mb-5 border-b border-nyay-border pb-4">
          <p className="text-sm font-semibold tracking-wide text-nyay-authority uppercase">
            Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-nyay-muted">
            Hearings, deadlines, and active matters at a glance.
          </p>
        </header>

        <section aria-labelledby="quick-stats-heading" className="mb-6">
          <h2
            id="quick-stats-heading"
            className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
          >
            <span
              className="h-1 w-6 rounded-full bg-nyay-authority"
              aria-hidden
            />
            Quick stats
          </h2>
          <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            {statsWithReminders.map((s) => {
              const iconWell =
                s.iconTone === "trust"
                  ? "bg-nyay-trust/[0.08] text-nyay-trust-mid dark:bg-white/[0.06] dark:text-nyay-trust-soft"
                  : "bg-nyay-authority-soft text-nyay-authority-rich dark:text-nyay-authority";
              return (
                <li
                  key={s.label}
                  className="flex gap-3 rounded-2xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--nyay-card),0_8px_24px_-8px_rgba(15,40,71,0.12)] dark:hover:shadow-[var(--nyay-card),0_8px_24px_-8px_rgba(0,0,0,0.35)]"
                >
                  <div
                    className={[
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
                      s.iconTone === "trust"
                        ? "ring-nyay-trust/10 dark:ring-white/10"
                        : "ring-nyay-authority/25 dark:ring-nyay-authority/30",
                      iconWell,
                    ].join(" ")}
                    aria-hidden
                  >
                    <QuickStatGlyph kind={s.icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-nyay-muted">
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-nyay-trust dark:text-foreground">
                      {s.value}
                    </p>
                    <p className="mt-1.5 text-xs leading-snug text-nyay-muted">
                      {s.hint}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <section aria-labelledby="hearings-heading">
            <h2
              id="hearings-heading"
              className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
            >
              <span
                className="h-1 w-6 rounded-full bg-nyay-authority"
                aria-hidden
              />
              Upcoming hearings
            </h2>
            <p className="mb-3 text-sm text-nyay-muted">
              <Link
                href={routes.calendar}
                className="font-medium text-nyay-authority-rich underline-offset-2 hover:underline dark:text-nyay-authority"
              >
                Open full calendar
              </Link>
            </p>
            <ul className="space-y-2.5">
              {upcomingHearings.length === 0 ? (
                <li className="rounded-xl border border-nyay-border bg-nyay-surface p-3 text-sm text-nyay-muted nyay-card-shadow">
                  No upcoming hearings in the loaded matters.
                </li>
              ) : (
                upcomingHearings.map((h) => (
                  <li
                    key={h.id}
                    className="rounded-xl border border-nyay-border border-l-4 border-l-nyay-authority bg-nyay-surface p-3 pl-2.5 nyay-card-shadow"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-nyay-authority-rich dark:text-nyay-authority">
                        <time dateTime={h.date}>{formatISODateShort(h.date)}</time>
                        {h.time ? (
                          <span className="font-medium text-nyay-muted">
                            {" "}
                            · {h.time}
                          </span>
                        ) : null}
                      </p>
                      <Link
                        href={routes.case(h.caseId)}
                        className="font-mono text-xs text-nyay-authority-rich hover:underline dark:text-nyay-authority"
                      >
                        {h.caseId}
                      </Link>
                    </div>
                    <p className="mt-1 font-medium text-nyay-trust dark:text-foreground">
                      {h.title}
                    </p>
                    <p className="mt-1 text-sm text-nyay-muted">{h.court}</p>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section aria-labelledby="deadlines-heading">
            <h2
              id="deadlines-heading"
              className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
            >
              <span
                className="h-1 w-6 rounded-full bg-nyay-authority"
                aria-hidden
              />
              Upcoming deadlines
            </h2>
            <ul className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <li className="rounded-xl border border-nyay-border bg-nyay-surface p-3 text-sm text-nyay-muted nyay-card-shadow">
                  No upcoming deadlines in the loaded data.
                </li>
              ) : (
                upcomingDeadlines.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start justify-between gap-2.5 rounded-xl border border-nyay-border bg-nyay-surface p-3 nyay-card-shadow"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-nyay-trust dark:text-foreground">
                        {d.title}
                      </p>
                      <Link
                        href={routes.case(d.caseId)}
                        className="mt-1 inline-block font-mono text-xs text-nyay-authority-rich hover:underline dark:text-nyay-authority"
                      >
                        {d.caseId}
                      </Link>
                      {d.priority === "high" ? (
                        <p className="mt-2 text-xs font-medium text-nyay-authority-rich dark:text-nyay-authority">
                          High priority
                        </p>
                      ) : null}
                    </div>
                    <time
                      className="shrink-0 rounded-lg bg-nyay-authority-soft px-2.5 py-1 text-sm font-semibold tabular-nums text-nyay-authority-fg dark:text-nyay-authority"
                      dateTime={d.date}
                    >
                      {formatISODateShort(d.date)}
                    </time>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <section aria-labelledby="active-cases-heading" className="mt-6">
          <h2
            id="active-cases-heading"
            className="mb-3 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
          >
            <span
              className="h-1 w-6 rounded-full bg-nyay-authority"
              aria-hidden
            />
            Active cases
          </h2>
          <div className="overflow-hidden rounded-xl border border-nyay-border bg-nyay-surface nyay-card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-nyay-border bg-nyay-canvas dark:bg-nyay-trust/10">
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Matter
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Client
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Stage
                    </th>
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Next date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activeCases.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-nyay-border/60 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={routes.case(c.id)}
                          className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority/50"
                        >
                          <span className="font-mono text-xs text-nyay-authority-rich group-hover:underline dark:text-nyay-authority">
                            {c.id}
                          </span>
                          <br />
                          <span className="font-medium text-nyay-trust group-hover:text-nyay-trust-mid dark:text-foreground dark:group-hover:text-foreground">
                            {c.title}
                          </span>
                          <span className="mt-1 block text-xs font-normal text-nyay-muted">
                            {c.nextFocus}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <MatterStatusBadge kind={c.status} />
                      </td>
                      <td className="px-4 py-3 text-nyay-muted">{c.client}</td>
                      <td className="px-4 py-3 text-nyay-muted">{c.stage}</td>
                      <td className="px-4 py-3 tabular-nums font-medium text-nyay-trust-mid dark:text-foreground">
                        {c.next}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
