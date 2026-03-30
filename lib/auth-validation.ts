export function emailOk(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function digitsOnly(v: string): string {
  return v.replace(/\D/g, "");
}

export function whatsappDigitsOk(v: string): boolean {
  return digitsOnly(v).length >= 10;
}

export function passwordOk(v: string): boolean {
  return v.length >= 8;
}

/** Email or mobile (10+ digits) for sign-in / reset. */
export function contactIdentifierOk(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  if (emailOk(t)) return true;
  return digitsOnly(t).length >= 10;
}

/** Stable key for OTP cookies: email lowercased, or digits-only mobile. */
export function normalizeContactKey(raw: string): string {
  const t = raw.trim();
  if (emailOk(t)) return t.toLowerCase();
  return digitsOnly(t);
}

export function registerOtpKey(email: string, mobileRaw: string): string {
  return `${email.trim().toLowerCase()}|${digitsOnly(mobileRaw)}`;
}

export function otpOk(v: string): boolean {
  return /^\d{6}$/.test(v.trim());
}
