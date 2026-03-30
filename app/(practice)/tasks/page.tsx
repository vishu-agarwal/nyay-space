"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  createAdvocateTask,
  deleteAdvocateTask,
  updateAdvocateTask,
  useAdvocateTasks,
  type AdvocateTask,
  type AdvocateTaskPriority,
} from "@/lib/advocate-tasks";
import { formatISODateShort, localISODate } from "@/lib/calendar-reminders";
import { useAdvocateCaseList } from "@/lib/use-case-management-store";
import { routes } from "@/lib/routes";

type StatusFilter = "open" | "done" | "all";

function priorityLabel(p: AdvocateTaskPriority): string {
  return p === "high" ? "High" : "Normal";
}

function priorityBadgeClass(p: AdvocateTaskPriority): string {
  return p === "high"
    ? "bg-red-500/15 text-red-900 ring-1 ring-red-600/25 dark:bg-red-400/12 dark:text-red-200 dark:ring-red-400/30"
    : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border dark:bg-white/[0.06] dark:text-nyay-muted";
}

function TasksPageContent() {
  const searchParams = useSearchParams();
  const { tasks } = useAdvocateTasks();
  const { cases: caseList } = useAdvocateCaseList();

  const [title, setTitle] = useState("");
  const [caseId, setCaseId] = useState("");
  const [dueDate, setDueDate] = useState(() => localISODate(new Date()));
  const [priority, setPriority] = useState<AdvocateTaskPriority>("normal");
  const [notes, setNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [matterFilter, setMatterFilter] = useState<string>("all");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("case");
    if (!fromUrl || !caseList.some((c) => c.id === fromUrl)) return;
    setCaseId(fromUrl);
    setMatterFilter(fromUrl);
  }, [searchParams, caseList]);

  useEffect(() => {
    if (caseList.length === 0) return;
    if (caseId && caseList.some((c) => c.id === caseId)) return;
    const fromUrl = searchParams.get("case");
    if (fromUrl && caseList.some((c) => c.id === fromUrl)) {
      setCaseId(fromUrl);
      return;
    }
    setCaseId(caseList[0].id);
  }, [caseList, caseId, searchParams]);

  const caseMeta = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of caseList) m.set(c.id, c.title);
    return m;
  }, [caseList]);

  const filtered = useMemo(() => {
    let rows =
      statusFilter === "all"
        ? tasks
        : tasks.filter((t) => (statusFilter === "open" ? t.status === "open" : t.status === "done"));
    if (matterFilter !== "all") {
      rows = rows.filter((t) => t.caseId === matterFilter);
    }
    return [...rows].sort((a, b) => {
      const da = a.dueDate || "9999-99-99";
      const db = b.dueDate || "9999-99-99";
      const c = da.localeCompare(db);
      if (c !== 0) return c;
      return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
    });
  }, [tasks, statusFilter, matterFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, AdvocateTask[]>();
    for (const t of filtered) {
      const key = t.caseId || "__none__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.dueDate || "9999-99-99").localeCompare(b.dueDate || "9999-99-99"));
    }
    const keys = [...map.keys()].sort((a, b) => {
      if (a === "__none__") return 1;
      if (b === "__none__") return -1;
      return a.localeCompare(b);
    });
    return keys.map((k) => ({
      key: k,
      caseId: k === "__none__" ? "" : k,
      title: k === "__none__" ? "Unassigned (legacy)" : caseMeta.get(k) ?? k,
      tasks: map.get(k)!,
    }));
  }, [filtered, caseMeta]);

  const todayKey = localISODate(new Date());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!caseList.length) {
      setFormError("Add a matter under Cases before creating tasks.");
      return;
    }
    const result = createAdvocateTask({
      title: title.trim(),
      caseId,
      dueDate: dueDate.trim(),
      priority,
      notes: notes.trim(),
    });
    if (!result.ok) {
      setFormError(result.reason);
      return;
    }
    setTitle("");
    setNotes("");
  };

  const toggleDone = (t: AdvocateTask) => {
    updateAdvocateTask({
      ...t,
      status: t.status === "open" ? "done" : "open",
    });
  };

  const remove = (t: AdvocateTask) => {
    if (!window.confirm(`Delete task "${t.title}"?`)) return;
    deleteAdvocateTask(t.id);
  };

  const noMatters = caseList.length === 0;

  return (
    <div className="min-h-full font-sans text-foreground">
      <header className="mb-5 border-b border-nyay-border pb-4">
        <p className="text-sm font-semibold tracking-wide text-nyay-authority uppercase">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-nyay-trust sm:text-3xl dark:text-foreground">
          Tasks / To-Do
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-nyay-muted">
          Every item belongs to a matter, with a <strong className="font-medium text-nyay-trust-mid">due date</strong> and{" "}
          <strong className="font-medium text-nyay-trust-mid">priority</strong>. The list is grouped by case below.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form onSubmit={submit} className="h-fit rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
          <h2 className="text-lg font-semibold text-nyay-trust dark:text-foreground">Add task</h2>
          {formError ? (
            <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-800 dark:text-red-200">
              {formError}
            </p>
          ) : null}
          <div className="mt-3 grid gap-3">
            <label className="text-sm text-nyay-muted">
              Title
              <input
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="File reply, brief witness, collect certified copy…"
                required
                disabled={noMatters}
              />
            </label>
            <label className="text-sm text-nyay-muted">
              Matter <span className="text-red-600 dark:text-red-400">*</span>
              <select
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                required
                disabled={noMatters}
              >
                {caseList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-nyay-muted">
              Due date <span className="text-red-600 dark:text-red-400">*</span>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                disabled={noMatters}
              />
            </label>
            <fieldset className="rounded-lg border border-nyay-border p-3">
              <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-nyay-muted">
                Priority <span className="text-red-600 dark:text-red-400">*</span>
              </legend>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriority("normal")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    priority === "normal"
                      ? "bg-nyay-authority-soft text-nyay-authority-fg"
                      : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"
                  }`}
                  disabled={noMatters}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("high")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    priority === "high"
                      ? "bg-red-500/15 text-red-900 ring-1 ring-red-600/25 dark:bg-red-400/12 dark:text-red-200"
                      : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"
                  }`}
                  disabled={noMatters}
                >
                  High
                </button>
              </div>
            </fieldset>
            <label className="text-sm text-nyay-muted">
              Notes (optional)
              <textarea
                className="mt-1 w-full rounded-lg border border-nyay-border bg-nyay-canvas px-3 py-2 text-sm text-nyay-trust"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instructions, delegation, or client reference…"
                disabled={noMatters}
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-nyay-trust px-4 py-2 text-sm font-semibold text-white hover:bg-nyay-trust-mid disabled:cursor-not-allowed disabled:opacity-50"
              disabled={noMatters}
            >
              Save task
            </button>
            {noMatters ? (
              <p className="text-xs text-nyay-muted">
                Create a matter first —{" "}
                <Link href={routes.cases} className="font-medium text-nyay-authority-rich hover:underline">
                  Cases
                </Link>
                .
              </p>
            ) : null}
          </div>
        </form>

        <section className="rounded-xl border border-nyay-border bg-nyay-surface p-4 nyay-card-shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-nyay-trust dark:text-foreground">By matter</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <label className="flex items-center gap-1.5 text-xs text-nyay-muted">
                <span className="sr-only">Matter</span>
                <select
                  className="rounded-lg border border-nyay-border bg-nyay-canvas px-2 py-1 text-xs font-medium text-nyay-trust"
                  value={matterFilter}
                  onChange={(e) => setMatterFilter(e.target.value)}
                >
                  <option value="all">All matters</option>
                  {caseList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}
                    </option>
                  ))}
                </select>
              </label>
              {(["open", "done", "all"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${
                    statusFilter === f
                      ? "bg-nyay-authority-soft text-nyay-authority-fg"
                      : "bg-nyay-canvas text-nyay-muted ring-1 ring-nyay-border"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-nyay-muted">{filtered.length} shown</p>
          {filtered.length === 0 ? (
            <p className="mt-4 text-sm text-nyay-muted">No tasks match this filter.</p>
          ) : (
            <div className="mt-4 space-y-6">
              {grouped.map((group) => (
                <div key={group.key}>
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-nyay-border/80 pb-2">
                    {group.caseId ? (
                      <Link
                        href={routes.case(group.caseId)}
                        className="font-mono text-sm font-semibold text-nyay-authority-rich hover:underline dark:text-nyay-authority"
                      >
                        {group.caseId}
                      </Link>
                    ) : (
                      <span className="font-mono text-sm font-semibold text-nyay-muted">—</span>
                    )}
                    <span className="text-sm text-nyay-muted">{group.title}</span>
                  </div>
                  <ul className="space-y-2">
                    {group.tasks.map((t) => {
                      const overdue = t.status === "open" && t.dueDate && t.dueDate < todayKey;
                      return (
                        <li
                          key={t.id}
                          className={[
                            "rounded-lg border px-3 py-2.5",
                            overdue
                              ? "border-red-500/40 bg-red-500/6 dark:bg-red-500/10"
                              : "border-nyay-border bg-nyay-canvas/40",
                          ].join(" ")}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p
                                className={
                                  t.status === "done"
                                    ? "font-medium text-nyay-muted line-through"
                                    : "font-medium text-nyay-trust dark:text-foreground"
                                }
                              >
                                {t.title}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                {t.dueDate ? (
                                  <time
                                    dateTime={t.dueDate}
                                    className="tabular-nums font-medium text-nyay-trust-mid dark:text-foreground"
                                  >
                                    Due {formatISODateShort(t.dueDate)}
                                  </time>
                                ) : (
                                  <span className="font-medium text-nyay-muted">Due date missing</span>
                                )}
                                {overdue ? (
                                  <span className="font-medium text-red-700 dark:text-red-300">Overdue</span>
                                ) : null}
                                <span
                                  className={[
                                    "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                    priorityBadgeClass(t.priority),
                                  ].join(" ")}
                                >
                                  {priorityLabel(t.priority)}
                                </span>
                              </div>
                              {t.notes ? <p className="mt-2 text-xs text-nyay-muted">{t.notes}</p> : null}
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleDone(t)}
                                className="rounded border border-nyay-border px-2 py-1 text-xs font-semibold"
                              >
                                {t.status === "open" ? "Done" : "Reopen"}
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(t)}
                                className="rounded border border-red-400/40 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full p-4 font-sans text-sm text-nyay-muted">Loading tasks…</div>
      }
    >
      <TasksPageContent />
    </Suspense>
  );
}
