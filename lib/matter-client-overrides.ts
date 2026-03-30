import {
  notifyNyayStorageChanged,
  NYAY_MATTER_OVERRIDES_KEY,
} from "./nyay-storage-events";

export type MatterClientOverrides = Record<string, string>;

const KEY = NYAY_MATTER_OVERRIDES_KEY;

export function parseStoredOverrides(raw: string): MatterClientOverrides {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as MatterClientOverrides;
    }
    return {};
  } catch {
    return {};
  }
}

export function loadMatterClientOverrides(): MatterClientOverrides {
  if (typeof window === "undefined") return {};
  return parseStoredOverrides(window.localStorage.getItem(KEY) ?? "{}");
}

export function saveMatterClientOverrides(o: MatterClientOverrides): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(o));
  notifyNyayStorageChanged();
}

export function setMatterLinkedClient(matterId: string, clientId: string): MatterClientOverrides {
  const next = { ...loadMatterClientOverrides(), [matterId]: clientId };
  saveMatterClientOverrides(next);
  return next;
}

export function clearMatterClientOverride(matterId: string): MatterClientOverrides {
  const cur = loadMatterClientOverrides();
  const next = { ...cur };
  delete next[matterId];
  saveMatterClientOverrides(next);
  return next;
}

export function effectiveClientId(
  matter: { id: string; clientId: string },
  overrides: MatterClientOverrides,
): string {
  return overrides[matter.id] ?? matter.clientId;
}
