export const NYAY_CLIENTS_EXTRA_KEY = "nyay-clients-extra";
export const NYAY_MATTER_OVERRIDES_KEY = "nyay-matter-client";

const EVENT = "nyay-local-storage";

export function subscribeNyayStorage(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const run = () => onStoreChange();
  window.addEventListener("storage", run);
  window.addEventListener(EVENT, run);
  return () => {
    window.removeEventListener("storage", run);
    window.removeEventListener(EVENT, run);
  };
}

export function notifyNyayStorageChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}
