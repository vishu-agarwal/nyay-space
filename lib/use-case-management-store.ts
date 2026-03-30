"use client";

import { useMemo, useSyncExternalStore } from "react";
import { subscribeNyayStorage } from "./nyay-storage-events";
import { NYAY_CASE_NOTES_KEY } from "./nyay-storage-events";
import { matters, type CaseDetailExtra, type Matter, type CaseStatus, type CaseType } from "./cases";
import {
  addTimelineEvent,
  buildCaseHistory,
  createUserCase,
  getMergedCaseDetail,
  getMergedCaseSummary,
  loadCaseOverrides,
  loadCaseStatusHistory,
  loadUserCases,
  type AdvocateCaseSummary,
  type CaseHistoryItem,
  type CreateCaseInput,
  updateCaseStatus,
  updateCaseType,
} from "./case-management-store";
import { parseNotesMap } from "./practice-notes";
import type { PracticeNote } from "./practice-notes";

const SSR_SNAPSHOT = "\0case_mgmt_ssr\0";
const SEP = "\u0001";

function readSnapshot(): string {
  if (typeof window === "undefined") return SSR_SNAPSHOT;
  // Include only the keys that affect case list/detail/history UI.
  const userCasesRaw = window.localStorage.getItem("nyay-user-cases-v1") ?? "{}";
  const overridesRaw = window.localStorage.getItem("nyay-case-overrides-v1") ?? "{}";
  const statusHistoryRaw =
    window.localStorage.getItem("nyay-case-status-history-v1") ?? "{}";
  const caseNotesRaw = window.localStorage.getItem(NYAY_CASE_NOTES_KEY) ?? "{}";
  return [userCasesRaw, overridesRaw, statusHistoryRaw, caseNotesRaw].join(SEP);
}

/**
 * Hook: merged advocate case list for UI filtering.
 * Note: for now it runs client-side only (localStorage demo).
 */
export function useAdvocateCaseList() {
  useSyncExternalStore(subscribeNyayStorage, readSnapshot, () => SSR_SNAPSHOT);

  const userCases = loadUserCases();
  const overrides = loadCaseOverrides();

  const seedIdSet = useMemo(() => new Set(matters.map((m) => m.id)), []);

  const listFromSeed = useMemo<AdvocateCaseSummary[]>(
    () =>
      matters.map((seed) =>
        getMergedCaseSummary(seed, overrides[seed.id], userCases),
      ),
    [userCases, overrides],
  );

  const listFromUsers = useMemo<AdvocateCaseSummary[]>(
    () =>
      Object.values(userCases)
        .filter((uc) => !seedIdSet.has(uc.id))
        .map((uc) => ({
          id: uc.id,
          title: uc.title,
          clientId: uc.clientId,
          stage: uc.stage,
          next: uc.next,
          court: uc.court,
          status: uc.status,
          caseType: uc.caseType,
        })),
    [userCases, seedIdSet],
  );

  const combined = useMemo(() => {
    const priority: Record<CaseStatus, number> = {
      urgent: 0,
      active: 1,
      closed: 2,
    };
    return [...listFromSeed, ...listFromUsers].sort((a, b) => {
      const pa = priority[a.status];
      const pb = priority[b.status];
      if (pa !== pb) return pa - pb;
      return a.title.localeCompare(b.title);
    });
  }, [listFromSeed, listFromUsers]);

  return { cases: combined };
}

export function useAdvocateCaseDetail(opts: {
  caseId: string;
  seedMatter?: Matter | null;
  seedExtra?: CaseDetailExtra | null;
}) {
  useSyncExternalStore(subscribeNyayStorage, readSnapshot, () => SSR_SNAPSHOT);

  const userCases = loadUserCases();
  const overrides = loadCaseOverrides();
  const statusHistory = loadCaseStatusHistory();
  const caseNotesRaw = typeof window !== "undefined" ? window.localStorage.getItem(NYAY_CASE_NOTES_KEY) : null;
  const notesMap = parseNotesMap(caseNotesRaw);

  const seedMatter = opts.seedMatter ?? null;
  const seedExtra = opts.seedExtra ?? null;

  const caseDetail = useMemo(() => {
    return getMergedCaseDetail({
      seedMatter,
      seedExtra,
      caseId: opts.caseId,
      overrides: overrides[opts.caseId],
      userCases,
    });
  }, [seedExtra, seedMatter, overrides, opts.caseId, userCases]);

  const notes = useMemo<PracticeNote[]>(() => {
    const list = notesMap[opts.caseId] ?? [];
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notesMap, opts.caseId]);

  const historyItems = useMemo<CaseHistoryItem[]>(() => {
    return buildCaseHistory({
      statusHistory: statusHistory[opts.caseId] ?? [],
      timeline: caseDetail.timeline,
      notes,
    });
  }, [caseDetail.timeline, notes, opts.caseId, statusHistory]);

  const currentStatus = caseDetail.status;

  return {
    caseDetail,
    notes,
    historyItems,
    actions: {
      setStatus: (nextStatus: CaseStatus) => {
        updateCaseStatus(opts.caseId, nextStatus, currentStatus);
      },
      setType: (nextType: CaseType) => {
        updateCaseType(opts.caseId, nextType);
      },
      addTimelineEvent: (ev: Parameters<typeof addTimelineEvent>[1]) => {
        addTimelineEvent(opts.caseId, ev);
      },
      createCase: (input: CreateCaseInput) => createUserCase(input),
    },
  };
}

