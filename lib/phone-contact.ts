/** Digits only for tel:/wa.me (no + or spaces). */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

/** E.164-style digits for India mobile: 91 + 10 digits when user enters local 10-digit. */
export function normalizeIndiaWhatsappDigits(raw: string): string {
  const d = digitsOnly(raw);
  if (d.length === 10) return `91${d}`;
  if (d.startsWith("91") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 11) return `91${d.slice(1)}`;
  return d;
}

export function telHref(phoneDisplay: string): string {
  const d = digitsOnly(phoneDisplay);
  return d ? `tel:${d}` : "#";
}

/** Opens WhatsApp chat; `phoneDigits` should be country code + national (e.g. 919876543210). */
export function whatsappWebUrl(phoneDigits: string, message?: string): string {
  const base = `https://wa.me/${phoneDigits}`;
  if (!message?.trim()) return base;
  const q = new URLSearchParams({ text: message });
  return `${base}?${q.toString()}`;
}
