"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdvocateTasks, type AdvocateTask } from "@/lib/advocate-tasks";
import { formatISODateShort, localISODate } from "@/lib/calendar-reminders";
import { routes } from "@/lib/routes";

type Props = {
  caseId: string;
  matterTitle?: string;
};

function priorityLabel(p: AdvocateTask["priority"]): string {
  return p === "high" ? "High" : "Normal";
}

export function CaseTasksPanel({ caseId, matterTitle }: Props) {
  const { tasks } = useAdvocateTasks();
  const todayKey = localISODate(new Date());

  const forCase = useMemo(() => {
    return tasks
      .filter((t) => t.caseId === caseId)
      .filter((t) => t.status === "open")
      .sort((a, b) => (a.dueDate || "9999-99-99").localeCompare(b.dueDate || "9999-99-99"));
  }, [tasks, caseId]);

  if (forCase.length === 0) {
    return (
      <section
        aria-labelledby="case-tasks-heading"
        className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 id="case-tasks-heading" className="text-base font-semibold text-nyay-trust dark:text-foreground">
            To-Do for this matter
          </h2>
          <Link
            href={`${routes.tasks}?case=${encodeURIComponent(caseId)}`}
            className="shrink-0 text-xs font-medium text-nyay-authority-rich hover:underline dark:text-nyay-authority"
          >
            Add task
          </Link>
        </div>
        <p className="mt-2 text-sm text-nyay-muted">No open tasks. Add one from the full list.</p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="case-tasks-heading"
      className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="case-tasks-heading" className="text-base font-semibold text-nyay-trust dark:text-foreground">
            To-Do for this matter
          </h2>
          {matterTitle ? (
            <p className="mt-0.5 text-xs text-nyay-muted line-clamp-2">{matterTitle}</p>
          ) : null}
        </div>
        <Link
          href={`${routes.tasks}?case=${encodeURIComponent(caseId)}`}
          className="shrink-0 text-xs font-medium text-nyay-authority-rich hover:underline dark:text-nyay-authority"
        >
          View all
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {forCase.map((t) => {
          const overdue = Boolean(t.dueDate && t.dueDate < todayKey);
          return (
            <li
              key={t.id}
              className={[
                "rounded-lg border px-3 py-2 text-sm",
                overdue
                  ? "border-red-500/35 bg-red-500/6 dark:bg-red-500/10"
                  : "border-nyay-border bg-nyay-canvas/50",
              ].join(" ")}
            >
              <p className="font-medium text-nyay-trust dark:text-foreground">{t.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-nyay-muted">
                {t.dueDate ? (
                  <time dateTime={t.dueDate} className="tabular-nums">
                    Due {formatISODateShort(t.dueDate)}
                  </time>
                ) : (
                  <span className="text-nyay-muted">Due date missing</span>
                )}
                {overdue ? (
                  <span className="font-medium text-red-700 dark:text-red-300">Overdue</span>
                ) : null}
                <span
                  className={
                    t.priority === "high"
                      ? "rounded-full bg-red-500/15 px-2 py-0.5 font-semibold text-red-800 dark:bg-red-400/15 dark:text-red-200"
                      : "rounded-full bg-nyay-canvas px-2 py-0.5 font-medium ring-1 ring-nyay-border"
                  }
                >
                  {priorityLabel(t.priority)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
