/**
 * Firm / support WhatsApp (digits only, with country code).
 * Used for advocate → office drafts from the app (wa.me link).
 */
export const PRACTICE_WHATSAPP_DIGITS = "91990986882";

/** Human-friendly label for UI copy (e.g. +91 99098 68882). */
export function practiceWhatsappDisplay(): string {
  const d = PRACTICE_WHATSAPP_DIGITS;
  if (d.startsWith("91") && d.length === 12) {
    const n = d.slice(2);
    return `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
  }
  return d ? `+${d}` : "";
}
