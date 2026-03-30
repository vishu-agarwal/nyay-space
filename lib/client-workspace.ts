import { notifyNyayStorageChanged } from "./nyay-storage-events";
import { useMemo, useSyncExternalStore } from "react";
import { subscribeNyayStorage } from "./nyay-storage-events";

export type ClientReminder = {
  id: string;
  title: string;
  dueOn: string;
  done: boolean;
};

export type ClientMeeting = {
  id: string;
  title: string;
  when: string;
  mode: "office" | "court" | "call" | "video";
};

export type ClientWorkspace = {
  clientId: string;
  specialNotes: string;
  consultationNotes: string;
  adviceLog: string;
  documentsSummary: string;
  reminders: ClientReminder[];
  meetings: ClientMeeting[];
};

const KEY = "nyay-client-workspace";

function emptyWorkspace(clientId: string): ClientWorkspace {
  return {
    clientId,
    specialNotes: "",
    consultationNotes: "",
    adviceLog: "",
    documentsSummary: "",
    reminders: [],
    meetings: [],
  };
}

function isWorkspaceShape(v: unknown): v is ClientWorkspace {
  if (v === null || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.clientId === "string";
}

function parseRaw(raw: string): Record<string, ClientWorkspace> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null || typeof parsed !== "object") return {};
    const input = parsed as Record<string, unknown>;
    const out: Record<string, ClientWorkspace> = {};
    for (const [k, val] of Object.entries(input)) {
      if (isWorkspaceShape(val)) out[k] = { ...emptyWorkspace(k), ...val };
    }
    return out;
  } catch {
    return {};
  }
}

export function loadClientWorkspaceMap(): Record<string, ClientWorkspace> {
  if (typeof window === "undefined") return {};
  return parseRaw(window.localStorage.getItem(KEY) ?? "{}");
}

export function getClientWorkspace(clientId: string): ClientWorkspace {
  const map = loadClientWorkspaceMap();
  return map[clientId] ?? emptyWorkspace(clientId);
}

export function saveClientWorkspace(workspace: ClientWorkspace): void {
  if (typeof window === "undefined") return;
  const map = loadClientWorkspaceMap();
  map[workspace.clientId] = workspace;
  window.localStorage.setItem(KEY, JSON.stringify(map));
  notifyNyayStorageChanged();
}

export function saveClientWorkspacePartial(
  clientId: string,
  patch: Partial<Omit<ClientWorkspace, "clientId">>,
): void {
  const curr = getClientWorkspace(clientId);
  saveClientWorkspace({ ...curr, ...patch, clientId });
}

export function useClientWorkspaceMap(): Record<string, ClientWorkspace> {
  const snapshot = useSyncExternalStore(
    subscribeNyayStorage,
    () => (typeof window === "undefined" ? "{}" : window.localStorage.getItem(KEY) ?? "{}"),
    () => "{}",
  );
  return useMemo(() => parseRaw(snapshot), [snapshot]);
}
