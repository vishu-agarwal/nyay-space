import { notifyNyayStorageChanged } from "./nyay-storage-events";
import type {
  CaseStatus,
  CaseType,
  TimelineEvent,
  CaseDocument,
  Matter,
  CaseDetailExtra,
} from "./cases";
import type { PracticeNote } from "./practice-notes";

export const NYAY_USER_CASES_KEY = "nyay-user-cases-v1";
export const NYAY_CASE_OVERRIDES_KEY = "nyay-case-overrides-v1";
export const NYAY_CASE_STATUS_HISTORY_KEY = "nyay-case-status-history-v1";

export type UserCase = Omit<Matter, "status"> & { status: CaseStatus; timelineExtra: TimelineEvent[] };

export type CaseUIOverrides = {
  status?: CaseStatus;
  caseType?: CaseType;
  timelineExtra?: TimelineEvent[];
  documentsExtra?: CaseDocument[];
};

export type CaseStatusHistoryItem = {
  id: string;
  createdAt: string; // ISO
  from: CaseStatus | null;
  to: CaseStatus;
};

export type CaseStatusHistoryMap = Record<string, CaseStatusHistoryItem[]>;
export type CaseOverridesMap = Record<string, CaseUIOverrides>;
export type UserCasesMap = Record<string, UserCase>;

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isTimelineEvent(x: unknown): x is TimelineEvent {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.date === "string" &&
    (o.time === undefined || typeof o.time === "string") &&
    typeof o.title === "string" &&
    (o.detail === undefined || typeof o.detail === "string") &&
    (o.kind === "hearing" ||
      o.kind === "filing" ||
      o.kind === "order" ||
      o.kind === "mediation" ||
      o.kind === "note")
  );
}

function sanitizeTimelineExtra(raw: unknown): TimelineEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isTimelineEvent);
}

function sanitizeOverrides(raw: unknown): CaseOverridesMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: CaseOverridesMap = {};
  for (const [caseId, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!caseId || !v || typeof v !== "object" || Array.isArray(v)) continue;
    const o = v as Record<string, unknown>;
    const status = o.status;
    const caseType = o.caseType;
    const timelineExtra = sanitizeTimelineExtra(o.timelineExtra);
    const documentsExtra = Array.isArray(o.documentsExtra) ? (o.documentsExtra as CaseDocument[]) : undefined;
    const docsOk =
      documentsExtra == null ||
      documentsExtra.every(
        (d) =>
          d &&
          typeof d === "object" &&
          typeof (d as CaseDocument).id === "string" &&
          typeof (d as CaseDocument).name === "string" &&
          typeof (d as CaseDocument).kind === "string" &&
          typeof (d as CaseDocument).updated === "string",
      );

    const statusOk = status === "active" || status === "closed" || status === "urgent";
    const typeOk = caseType === "civil" || caseType === "criminal" || caseType === "family";

    const anySet =
      statusOk || typeOk || timelineExtra.length > 0 || (docsOk && documentsExtra !== undefined);
    if (!anySet) continue;

    out[caseId] = {
      ...(statusOk ? { status: status as CaseStatus } : {}),
      ...(typeOk ? { caseType: caseType as CaseType } : {}),
      ...(timelineExtra.length ? { timelineExtra } : {}),
      ...(docsOk && documentsExtra ? { documentsExtra } : {}),
    };
  }
  return out;
}

function sanitizeUserCaseMap(raw: unknown): UserCasesMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: UserCasesMap = {};
  for (const [caseId, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!caseId || !v || typeof v !== "object" || Array.isArray(v)) continue;
    const o = v as Record<string, unknown>;
    const status = o.status;
    const caseType = o.caseType;
    const timelineExtra = sanitizeTimelineExtra(o.timelineExtra);
    const ok =
      typeof o.id === "string" &&
      typeof o.title === "string" &&
      typeof o.clientId === "string" &&
      typeof o.stage === "string" &&
      (o.next === null || typeof o.next === "string") &&
      typeof o.court === "string" &&
      (status === "active" || status === "closed" || status === "urgent") &&
      (caseType === "civil" || caseType === "criminal" || caseType === "family");
    if (!ok) continue;

    out[caseId] = {
      id: o.id as string,
      title: o.title as string,
      clientId: o.clientId as string,
      stage: o.stage as string,
      next: (o.next as string | null) ?? null,
      court: o.court as string,
      caseType: caseType as CaseType,
      status: status as CaseStatus,
      timelineExtra,
    };
  }
  return out;
}

function sanitizeStatusHistory(raw: unknown): CaseStatusHistoryMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: CaseStatusHistoryMap = {};
  for (const [caseId, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!caseId || !Array.isArray(v)) continue;
    const items: CaseStatusHistoryItem[] = [];
    for (const it of v) {
      if (!it || typeof it !== "object" || Array.isArray(it)) continue;
      const o = it as Record<string, unknown>;
      const to = o.to;
      const from = o.from;
      const okTo = to === "active" || to === "closed" || to === "urgent";
      const okFrom =
        from === null || from === "active" || from === "closed" || from === "urgent";
      if (
        okTo &&
        okFrom &&
        typeof o.id === "string" &&
        typeof o.createdAt === "string"
      ) {
        items.push({
          id: o.id as string,
          createdAt: o.createdAt as string,
          from: from as CaseStatus | null,
          to: to as CaseStatus,
        });
      }
    }
    if (items.length) out[caseId] = items;
  }
  return out;
}

function getStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

export function loadUserCases(): UserCasesMap {
  return sanitizeUserCaseMap(safeJsonParse<UserCasesMap>(getStorageItem(NYAY_USER_CASES_KEY)));
}

export function loadCaseOverrides(): CaseOverridesMap {
  return sanitizeOverrides(safeJsonParse<CaseOverridesMap>(getStorageItem(NYAY_CASE_OVERRIDES_KEY)));
}

export function loadCaseStatusHistory(): CaseStatusHistoryMap {
  return sanitizeStatusHistory(
    safeJsonParse<CaseStatusHistoryMap>(getStorageItem(NYAY_CASE_STATUS_HISTORY_KEY)),
  );
}

export type CreateCaseInput = {
  id: string;
  title: string;
  clientId: string;
  stage: string;
  next: string | null;
  court: string;
  status: CaseStatus;
  caseType: CaseType;
};

export function createUserCase(input: CreateCaseInput): { ok: true } | { ok: false; reason: string } {
  const id = input.id.trim();
  if (!id) return { ok: false, reason: "Case ID is required." };
  if (!input.title.trim()) return { ok: false, reason: "Case title is required." };
  if (!input.clientId.trim()) return { ok: false, reason: "Client is required." };
  if (!input.stage.trim()) return { ok: false, reason: "Stage is required." };
  if (!input.court.trim()) return { ok: false, reason: "Court is required." };
  const status = input.status;
  const caseType = input.caseType;

  const userCases = loadUserCases();
  if (userCases[id]) return { ok: false, reason: "A case with this ID already exists." };

  const next = input.next?.trim() ? input.next.trim() : null;
  const userCase: UserCase = {
    id,
    title: input.title.trim(),
    clientId: input.clientId.trim(),
    stage: input.stage.trim(),
    next,
    court: input.court.trim(),
    status,
    caseType,
    timelineExtra: [],
  };
  userCases[id] = userCase;
  setStorageItem(NYAY_USER_CASES_KEY, JSON.stringify(userCases));
  notifyNyayStorageChanged();
  return { ok: true };
}

export function addTimelineEvent(
  caseId: string,
  ev: Omit<TimelineEvent, "id"> & { id?: string },
): void {
  const userCases = loadUserCases();
  const overrides = loadCaseOverrides();

  const event: TimelineEvent = {
    id: ev.id?.trim() ? ev.id.trim() : newId("t"),
    date: ev.date,
    time: ev.time,
    title: ev.title.trim(),
    detail: ev.detail?.trim() || undefined,
    kind: ev.kind,
  };

  if (userCases[caseId]) {
    userCases[caseId] = { ...userCases[caseId], timelineExtra: [...userCases[caseId].timelineExtra, event] };
    setStorageItem(NYAY_USER_CASES_KEY, JSON.stringify(userCases));
  } else {
    const cur = overrides[caseId] ?? {};
    const timelineExtra = [...(cur.timelineExtra ?? []), event];
    overrides[caseId] = { ...cur, timelineExtra };
    setStorageItem(NYAY_CASE_OVERRIDES_KEY, JSON.stringify(overrides));
  }

  notifyNyayStorageChanged();
}

export function updateCaseStatus(
  caseId: string,
  nextStatus: CaseStatus,
  fromStatus: CaseStatus | null,
): void {
  const userCases = loadUserCases();
  const overrides = loadCaseOverrides();
  const history = loadCaseStatusHistory();

  if (userCases[caseId]) {
    userCases[caseId] = { ...userCases[caseId], status: nextStatus };
    setStorageItem(NYAY_USER_CASES_KEY, JSON.stringify(userCases));
  } else {
    const cur = overrides[caseId] ?? {};
    overrides[caseId] = { ...cur, status: nextStatus };
    setStorageItem(NYAY_CASE_OVERRIDES_KEY, JSON.stringify(overrides));
  }

  const item: CaseStatusHistoryItem = {
    id: newId("h"),
    createdAt: new Date().toISOString(),
    from: fromStatus,
    to: nextStatus,
  };
  const next = [...(history[caseId] ?? []), item];
  history[caseId] = next;
  setStorageItem(NYAY_CASE_STATUS_HISTORY_KEY, JSON.stringify(history));
  notifyNyayStorageChanged();
}

export function updateCaseType(caseId: string, nextType: CaseType): void {
  const userCases = loadUserCases();
  const overrides = loadCaseOverrides();

  if (userCases[caseId]) {
    userCases[caseId] = { ...userCases[caseId], caseType: nextType };
    setStorageItem(NYAY_USER_CASES_KEY, JSON.stringify(userCases));
  } else {
    const cur = overrides[caseId] ?? {};
    overrides[caseId] = { ...cur, caseType: nextType };
    setStorageItem(NYAY_CASE_OVERRIDES_KEY, JSON.stringify(overrides));
  }

  notifyNyayStorageChanged();
}

// ---- Merging helpers used by UI ----

export type AdvocateCaseSummary = {
  id: string;
  title: string;
  clientId: string;
  stage: string;
  next: string | null;
  court: string;
  status: CaseStatus;
  caseType: CaseType;
};

export function getMergedCaseSummary(
  seed: Matter,
  overrides: CaseUIOverrides | undefined,
  userCases: UserCasesMap | undefined,
): AdvocateCaseSummary {
  const user = userCases?.[seed.id];
  const status = user?.status ?? overrides?.status ?? seed.status;
  const caseType = user?.caseType ?? overrides?.caseType ?? seed.caseType;
  return {
    id: seed.id,
    title: seed.title,
    clientId: seed.clientId,
    stage: seed.stage,
    next: seed.next,
    court: seed.court,
    status,
    caseType,
  };
}

export function getMergedCaseTimeline(
  opts: {
    seedExtra?: CaseDetailExtra | null;
    seedMatter?: Matter | null;
    caseId: string;
    overrides: CaseUIOverrides | undefined;
    userCases: UserCasesMap | undefined;
  },
): TimelineEvent[] {
  if (opts.userCases?.[opts.caseId]) {
    return [...opts.userCases[opts.caseId].timelineExtra].sort(compareTimelineEventAsc);
  }
  const base = opts.seedExtra?.timeline ?? [];
  const extra = opts.overrides?.timelineExtra ?? [];
  return [...base, ...extra].sort(compareTimelineEventAsc);
}

function compareTimelineEventAsc(a: TimelineEvent, b: TimelineEvent): number {
  const aKey = new Date(`${a.date}T${a.time ?? "00:00"}:00`).getTime();
  const bKey = new Date(`${b.date}T${b.time ?? "00:00"}:00`).getTime();
  return (aKey || 0) - (bKey || 0);
}

export function getCaseStatusFrom(
  seed: Matter | null,
  overrides: CaseUIOverrides | undefined,
  userCases: UserCasesMap | undefined,
  caseId: string,
): CaseStatus | null {
  if (userCases?.[caseId]) return userCases[caseId].status;
  return overrides?.status ?? seed?.status ?? null;
}

export function getMergedCaseDetail(
  opts: {
    seedMatter?: Matter | null;
    seedExtra?: CaseDetailExtra | null;
    caseId: string;
    overrides: CaseUIOverrides | undefined;
    userCases: UserCasesMap | undefined;
  },
): {
  id: string;
  title: string;
  clientId: string;
  stage: string;
  next: string | null;
  court: string;
  status: CaseStatus;
  caseType: CaseType;
  synopsis?: string;
  nextHearing?: string;
  timeline: TimelineEvent[];
} {
  const user = opts.userCases?.[opts.caseId];
  const seed = opts.seedMatter ?? null;
  const status = user?.status ?? opts.overrides?.status ?? seed?.status ?? "active";
  const caseType = user?.caseType ?? opts.overrides?.caseType ?? seed?.caseType ?? "civil";
  const title = user?.title ?? seed?.title ?? opts.caseId;
  const clientId = user?.clientId ?? seed?.clientId ?? "";
  const stage = user?.stage ?? seed?.stage ?? "";
  const next = user?.next ?? seed?.next ?? null;
  const court = user?.court ?? seed?.court ?? "";
  const synopsis = user ? undefined : opts.seedExtra?.synopsis;
  const nextHearing = user ? undefined : opts.seedExtra?.nextHearing;
  const timeline = getMergedCaseTimeline({
    seedExtra: opts.seedExtra ?? null,
    seedMatter: seed,
    caseId: opts.caseId,
    overrides: opts.overrides,
    userCases: opts.userCases,
  });

  return {
    id: opts.caseId,
    title,
    clientId,
    stage,
    next,
    court,
    status,
    caseType,
    synopsis,
    nextHearing,
    timeline,
  };
}

export type CaseHistoryItem = {
  id: string;
  createdAt: string; // ISO
  kind: "status" | "timeline" | "note";
  title: string;
  detail?: string;
};

function toHistoryCreatedAtFromTimeline(ev: TimelineEvent): string {
  // Timeline events store `date` + optional `time` used for display; history ordering uses createdAt.
  const d = new Date(`${ev.date}T${ev.time ?? "00:00"}:00`);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export function buildCaseHistory({
  statusHistory,
  timeline,
  notes,
}: {
  statusHistory: CaseStatusHistoryItem[];
  timeline: TimelineEvent[];
  notes: PracticeNote[];
}): CaseHistoryItem[] {
  const statusItems: CaseHistoryItem[] = statusHistory.map((h) => ({
    id: h.id,
    createdAt: h.createdAt,
    kind: "status",
    title: `Status: ${h.from ?? "—"} → ${h.to}`,
  }));

  const timelineItems: CaseHistoryItem[] = timeline.map((ev) => ({
    id: ev.id,
    createdAt: toHistoryCreatedAtFromTimeline(ev),
    kind: "timeline",
    title: ev.title,
    detail: ev.detail ?? ev.kind,
  }));

  const noteItems: CaseHistoryItem[] = notes.map((n) => ({
    id: n.id,
    createdAt: n.createdAt,
    kind: "note",
    title: "Case note",
    detail: n.body,
  }));

  return [...statusItems, ...timelineItems, ...noteItems].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

