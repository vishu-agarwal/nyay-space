import Link from "next/link";

type QuickStatIconKind = "cases" | "hearings" | "deadlines" | "onTrack";

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

function QuickStatGlyph({ kind }: { kind: QuickStatIconKind }) {
  const stroke = (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "cases" && (
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
      )}
      {kind === "hearings" && (
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
      )}
      {kind === "deadlines" && (
        <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      )}
      {kind === "onTrack" && (
        <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      )}
    </g>
  );
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      aria-hidden
    >
      {stroke}
    </svg>
  );
}

const todaysHearings = [
  {
    time: "10:30 AM",
    case: "Sharma vs. Metro Developers",
    court: "District Court, Saket",
    room: "Court 4",
  },
  {
    time: "11:45 AM",
    case: "Patel Estate — partition suit",
    court: "High Court",
    room: "Bench II",
  },
  {
    time: "2:15 PM",
    case: "R. Kumar (bail application)",
    court: "Sessions Court",
    room: "Court 1",
  },
];

const upcomingDeadlines = [
  { date: "Mar 29", title: "Written statement", caseRef: "CV-2024-118" },
  { date: "Mar 31", title: "Evidence affidavit", caseRef: "ARB-2023-44" },
  { date: "Apr 2", title: "Reply to counter-claim", caseRef: "CV-2025-02" },
  { date: "Apr 5", title: "Mediation appearance", caseRef: "MED-2024-09" },
];

const activeCases = [
  {
    id: "CV-2025-02",
    title: "Contract dispute — supply agreement",
    client: "Northwind Traders",
    stage: "Written statements",
    next: "Apr 2",
  },
  {
    id: "CR-2024-881",
    title: "Bail & trial prep",
    client: "A. Khan",
    stage: "Hearing cycle",
    next: "Mar 28",
  },
  {
    id: "ARB-2023-44",
    title: "Construction arbitration",
    client: "BuildWell LLP",
    stage: "Evidence",
    next: "Mar 31",
  },
  {
    id: "CV-2024-118",
    title: "Property injunction",
    client: "S. Reddy",
    stage: "Pleadings",
    next: "Mar 29",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full font-sans text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-nyay-border pb-6">
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

        <section aria-labelledby="quick-stats-heading" className="mb-10">
          <h2
            id="quick-stats-heading"
            className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
          >
            <span
              className="h-1 w-6 rounded-full bg-nyay-authority"
              aria-hidden
            />
            Quick stats
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {quickStats.map((s) => {
              const iconWell =
                s.iconTone === "trust"
                  ? "bg-nyay-trust/[0.08] text-nyay-trust-mid dark:bg-white/[0.06] dark:text-nyay-trust-soft"
                  : "bg-nyay-authority-soft text-nyay-authority-rich dark:text-nyay-authority";
              return (
                <li
                  key={s.label}
                  className="flex gap-4 rounded-2xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--nyay-card),0_8px_24px_-8px_rgba(15,40,71,0.12)] dark:hover:shadow-[var(--nyay-card),0_8px_24px_-8px_rgba(0,0,0,0.35)]"
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

        <div className="grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="hearings-heading">
            <h2
              id="hearings-heading"
              className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
            >
              <span
                className="h-1 w-6 rounded-full bg-nyay-authority"
                aria-hidden
              />
              Today&apos;s hearings
            </h2>
            <ul className="space-y-3">
              {todaysHearings.map((h) => (
                <li
                  key={`${h.time}-${h.case}`}
                  className="rounded-xl border border-nyay-border border-l-4 border-l-nyay-authority bg-nyay-surface p-4 pl-3 nyay-card-shadow"
                >
                  <p className="text-sm font-semibold text-nyay-authority-rich dark:text-nyay-authority">
                    {h.time}
                  </p>
                  <p className="mt-1 font-medium text-nyay-trust dark:text-foreground">
                    {h.case}
                  </p>
                  <p className="mt-1 text-sm text-nyay-muted">
                    {h.court}
                    <span className="text-nyay-muted/50"> · </span>
                    {h.room}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="deadlines-heading">
            <h2
              id="deadlines-heading"
              className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
            >
              <span
                className="h-1 w-6 rounded-full bg-nyay-authority"
                aria-hidden
              />
              Upcoming deadlines
            </h2>
            <ul className="space-y-3">
              {upcomingDeadlines.map((d) => (
                <li
                  key={`${d.date}-${d.caseRef}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow"
                >
                  <div>
                    <p className="font-medium text-nyay-trust dark:text-foreground">
                      {d.title}
                    </p>
                    <p className="mt-1 text-sm text-nyay-muted">{d.caseRef}</p>
                  </div>
                  <time
                    className="shrink-0 rounded-lg bg-nyay-authority-soft px-2.5 py-1 text-sm font-semibold tabular-nums text-nyay-authority-fg dark:text-nyay-authority"
                    dateTime={d.date}
                  >
                    {d.date}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="active-cases-heading" className="mt-10">
          <h2
            id="active-cases-heading"
            className="mb-4 flex items-center gap-2 text-lg font-semibold text-nyay-trust dark:text-foreground"
          >
            <span
              className="h-1 w-6 rounded-full bg-nyay-authority"
              aria-hidden
            />
            Active cases
          </h2>
          <div className="overflow-hidden rounded-xl border border-nyay-border bg-nyay-surface nyay-card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-nyay-border bg-nyay-canvas dark:bg-nyay-trust/10">
                    <th className="px-4 py-3 font-semibold text-nyay-trust dark:text-foreground">
                      Matter
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
                          href={`/dashboard/cases/${encodeURIComponent(c.id)}`}
                          className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-nyay-authority/50"
                        >
                          <span className="font-mono text-xs text-nyay-authority-rich group-hover:underline dark:text-nyay-authority">
                            {c.id}
                          </span>
                          <br />
                          <span className="font-medium text-nyay-trust group-hover:text-nyay-trust-mid dark:text-foreground dark:group-hover:text-foreground">
                            {c.title}
                          </span>
                        </Link>
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
