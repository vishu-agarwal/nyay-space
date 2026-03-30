"use client";

import { useMemo, useSyncExternalStore } from "react";
import { notifyNyayStorageChanged, subscribeNyayStorage } from "./nyay-storage-events";

export const NYAY_ADVOCATE_TASKS_KEY = "nyay-advocate-tasks-v1";

export type AdvocateTaskStatus = "open" | "done";
export type AdvocateTaskPriority = "high" | "normal";

export type AdvocateTask = {
  id: string;
  title: string;
  /** Matter reference (required for new tasks; legacy rows may be empty). */
  caseId: string;
  /** ISO date YYYY-MM-DD (required for new tasks). */
  dueDate: string;
  status: AdvocateTaskStatus;
  priority: AdvocateTaskPriority;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidTaskDueDate(iso: string): boolean {
  const s = iso.trim();
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(s + "T12:00:00");
  return !Number.isNaN(d.getTime());
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `task-${crypto.randomUUID().slice(0, 10)}`;
  }
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitize(raw: unknown): AdvocateTask[] {
  if (!Array.isArray(raw)) return [];
  const out: AdvocateTask[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || typeof r.title !== "string") continue;
    const status = r.status === "done" ? "done" : "open";
    const priority = r.priority === "high" ? "high" : "normal";
    out.push({
      id: r.id,
      title: r.title.trim(),
      caseId: typeof r.caseId === "string" ? r.caseId.trim() : "",
      dueDate: typeof r.dueDate === "string" ? r.dueDate.trim() : "",
      status,
      priority,
      notes: typeof r.notes === "string" ? r.notes : "",
      createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
      updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : new Date().toISOString(),
    });
  }
  return out;
}

export function loadAdvocateTasks(): AdvocateTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NYAY_ADVOCATE_TASKS_KEY);
    return sanitize(raw ? (JSON.parse(raw) as unknown) : []);
  } catch {
    return [];
  }
}

function saveTasks(tasks: AdvocateTask[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NYAY_ADVOCATE_TASKS_KEY, JSON.stringify(tasks));
  notifyNyayStorageChanged();
}

export function createAdvocateTask(input: {
  title: string;
  caseId: string;
  dueDate: string;
  priority: AdvocateTaskPriority;
  notes?: string;
}): { ok: true; task: AdvocateTask } | { ok: false; reason: string } {
  const title = input.title.trim();
  if (!title) return { ok: false, reason: "Title is required." };
  const caseId = input.caseId.trim();
  if (!caseId) return { ok: false, reason: "Select a matter — tasks are tracked per case." };
  const dueDate = input.dueDate.trim();
  if (!dueDate || !isValidTaskDueDate(dueDate)) {
    return { ok: false, reason: "Due date is required (use a valid calendar date)." };
  }
  const now = new Date().toISOString();
  const task: AdvocateTask = {
    id: makeId(),
    title,
    caseId,
    dueDate,
    status: "open",
    priority: input.priority,
    notes: (input.notes ?? "").trim(),
    createdAt: now,
    updatedAt: now,
  };
  const all = loadAdvocateTasks();
  saveTasks([task, ...all]);
  return { ok: true, task };
}

export function updateAdvocateTask(task: AdvocateTask): void {
  const all = loadAdvocateTasks();
  const next = all.map((t) => (t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t));
  saveTasks(next);
}

export function deleteAdvocateTask(id: string): void {
  const all = loadAdvocateTasks();
  saveTasks(all.filter((t) => t.id !== id));
}

export function useAdvocateTasks() {
  const snapshot = useSyncExternalStore(
    subscribeNyayStorage,
    () =>
      typeof window === "undefined" ? "[]" : window.localStorage.getItem(NYAY_ADVOCATE_TASKS_KEY) ?? "[]",
    () => "[]",
  );
  const tasks = useMemo(() => {
    try {
      return sanitize(JSON.parse(snapshot) as unknown);
    } catch {
      return [];
    }
  }, [snapshot]);
  return { tasks };
}
