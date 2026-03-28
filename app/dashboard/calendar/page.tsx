import Link from "next/link";
import {
  filingDeadlines,
  formatMonthTitle,
  getHearingReminders,
  getMonthGrid,
  localISODate,
  remindersByDate,
} from "@/lib/calendar-reminders";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function formatISODateLong(iso: string): string {
  const [y, mo, d] = iso.split("-").map(Number);
  if (!y || !mo || !d) return iso;
  return new Date(y, mo - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CalendarPage() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const todayKey = localISODate(today);

  const hearings = getHearingReminders();
  const byDate = remindersByDate(hearings, filingDeadlines);
  const grid = getMonthGrid(y, m);

  const upcomingHearings = hearings.filter((h) => h.date >= todayKey).slice(0, 12);
  const upcomingDeadlines = filingDeadlines
    .filter((d) => d.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-nyay-border pb-6">
          <p className="text-sm font-semibold tracking-wide text-nyay-authority uppercase">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-nyay-authority-rich"
            >
              Nyay Space
            </Link>
            <span className="text-nyay-muted/70"> / </span>
            Calendar
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
            Calendar &amp; reminders
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-nyay-muted">
            Hearing dates and filing deadlines in one place. Blue dots mark hearings, gold dots
            mark deadlines on the grid.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <section
            aria-labelledby="month-calendar-heading"
            className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow sm:p-6"
          >
            <h2
              id="month-calendar-heading"
              className="mb-4 text-lg font-semibold text-nyay-trust dark:text-foreground"
            >
              {formatMonthTitle(y, m)}
            </h2>
            <div
              className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-nyay-muted sm:text-sm"
              role="rowgroup"
            >
              {weekdayLabels.map((w) => (
                <div key={w} className="py-2" role="columnheader">
                  {w}
                </div>
              ))}
            </div>
            <div
              className="mt-1 grid grid-cols-7 gap-1 text-sm"
              role="grid"
              aria-label={`Calendar for ${formatMonthTitle(y, m)}`}
            >
              {grid.map((cell) => {
                const bucket = byDate.get(cell.date);
                const hasHearing = (bucket?.hearings.length ?? 0) > 0;
                const hasDeadline = (bucket?.deadlines.length ?? 0) > 0;
                const isToday = cell.date === todayKey;
                return (
                  <div
                    key={`${cell.date}-${cell.day}-${cell.isCurrentMonth}`}
                    role="gridcell"
                    className={[
                      "relative flex min-h-11 flex-col items-center justify-start rounded-lg border border-transparent py-1.5 sm:min-h-13",
                      cell.isCurrentMonth
                        ? "text-nyay-trust dark:text-foreground"
                        : "text-nyay-muted/40",
                      isToday
                        ? "border-nyay-authority/50 bg-nyay-authority-soft"
                        : cell.isCurrentMonth
                          ? "hover:bg-nyay-canvas dark:hover:bg-nyay-trust/10"
                          : "",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "tabular-nums",
                        isToday ? "font-semibold text-nyay-authority-rich dark:text-nyay-authority" : "",
                      ].join(" ")}
                    >
                      {cell.day}
                    </span>
                    <span className="mt-0.5 flex gap-0.5" aria-hidden>
                      {hasHearing ? (
                        <span className="size-1.5 rounded-full bg-nyay-trust-mid dark:bg-nyay-trust-soft" />
                      ) : null}
                      {hasDeadline ? (
                        <span className="size-1.5 rounded-full bg-nyay-authority" />
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex flex-wrap gap-4 border-t border-nyay-border pt-4 text-xs text-nyay-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-nyay-trust-mid dark:bg-nyay-trust-soft" />
                Hearing
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-nyay-authority" />
                Deadline
              </span>
            </p>
          </section>

          <div className="space-y-8">
            <section aria-labelledby="hearings-reminders-heading">
              <h2
                id="hearings-reminders-heading"
                className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
              >
                <span
                  className="h-1 w-6 rounded-full bg-nyay-authority"
                  aria-hidden
                />
                Hearing dates
              </h2>
              <ul className="space-y-3">
                {upcomingHearings.length === 0 ? (
                  <li className="rounded-xl border border-nyay-border bg-nyay-surface p-4 text-sm text-nyay-muted nyay-card-shadow">
                    No upcoming hearings in the loaded matters.
                  </li>
                ) : (
                  upcomingHearings.map((h) => (
                    <li
                      key={h.id}
                      className="rounded-xl border border-nyay-border border-l-4 border-l-nyay-authority bg-nyay-surface p-4 pl-3 nyay-card-shadow"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <time
                          className="text-sm font-semibold text-nyay-authority-rich dark:text-nyay-authority"
                          dateTime={h.date}
                        >
                          {formatISODateLong(h.date)}
                          {h.time ? (
                            <span className="font-medium text-nyay-muted">
                              {" "}
                              · {h.time}
                            </span>
                          ) : null}
                        </time>
                        <Link
                          href={`/dashboard/cases/${encodeURIComponent(h.caseId)}`}
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

            <section aria-labelledby="deadlines-reminders-heading">
              <h2
                id="deadlines-reminders-heading"
                className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
              >
                <span
                  className="h-1 w-6 rounded-full bg-nyay-authority"
                  aria-hidden
                />
                Deadlines
              </h2>
              <ul className="space-y-3">
                {upcomingDeadlines.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-nyay-trust dark:text-foreground">
                        {d.title}
                      </p>
                      <Link
                        href={`/dashboard/cases/${encodeURIComponent(d.caseId)}`}
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
                      {formatISODateLong(d.date)}
                    </time>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
