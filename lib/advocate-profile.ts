const KEY = "nyay-advocate-profile";

export type AdvocateProfile = {
  name: string;
  whatsapp: string;
};

/** Shown in support message templates when no registration data exists yet. */
export const DEFAULT_ADVOCATE_DISPLAY_NAME = "Advocate Anshika";

export function loadAdvocateProfile(): AdvocateProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (o === null || typeof o !== "object") return null;
    const r = o as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    const whatsapp = typeof r.whatsapp === "string" ? r.whatsapp.trim() : "";
    if (!name && !whatsapp) return null;
    return { name: name || DEFAULT_ADVOCATE_DISPLAY_NAME, whatsapp };
  } catch {
    return null;
  }
}

export function saveAdvocateProfile(profile: AdvocateProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    KEY,
    JSON.stringify({
      name: profile.name.trim() || DEFAULT_ADVOCATE_DISPLAY_NAME,
      whatsapp: profile.whatsapp.trim(),
    }),
  );
}

export function advocateDisplayName(): string {
  return loadAdvocateProfile()?.name?.trim() || DEFAULT_ADVOCATE_DISPLAY_NAME;
}
