"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseStoredExtraClients } from "./clients";
import { parseStoredOverrides } from "./matter-client-overrides";
import {
  NYAY_CLIENTS_EXTRA_KEY,
  NYAY_MATTER_OVERRIDES_KEY,
  subscribeNyayStorage,
} from "./nyay-storage-events";

/** Snapshot marker only used as `getServerSnapshot` (never stored in localStorage). */
export const NYAY_STORAGE_SSR = "\0nyay_ssr\0";

function readCombinedFromWindow(): string {
  const clients = window.localStorage.getItem(NYAY_CLIENTS_EXTRA_KEY) ?? "[]";
  const overrides = window.localStorage.getItem(NYAY_MATTER_OVERRIDES_KEY) ?? "{}";
  return `${clients}\u0001${overrides}`;
}

function parseCombined(raw: string): {
  extraClients: ReturnType<typeof parseStoredExtraClients>;
  overrides: ReturnType<typeof parseStoredOverrides>;
} {
  if (raw === NYAY_STORAGE_SSR) {
    return { extraClients: [], overrides: {} };
  }
  const sep = raw.indexOf("\u0001");
  if (sep < 0) {
    return { extraClients: [], overrides: {} };
  }
  return {
    extraClients: parseStoredExtraClients(raw.slice(0, sep)),
    overrides: parseStoredOverrides(raw.slice(sep + 1)),
  };
}

export function useNyayStorage() {
  const combined = useSyncExternalStore(
    subscribeNyayStorage,
    readCombinedFromWindow,
    () => NYAY_STORAGE_SSR,
  );

  const parsed = useMemo(() => parseCombined(combined), [combined]);
  const hydrated = combined !== NYAY_STORAGE_SSR;

  return { ...parsed, hydrated };
}
