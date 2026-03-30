import { cookies } from "next/headers";

/** Stub OTP delivery: replace with SMS/email provider. */
const OTP_TTL_SEC = 600;

type OtpPurpose = "login" | "register" | "forgot";

type OtpCookieValue = {
  purpose: OtpPurpose;
  /** Normalized channel key (email lowercased or mobile digits) */
  key: string;
  code: string;
  exp: number;
};

const COOKIE_OTP = "nyay_otp_stub";
const COOKIE_FORGOT_OK = "nyay_forgot_ok";

async function readOtp(): Promise<OtpCookieValue | null> {
  const raw = (await cookies()).get(COOKIE_OTP)?.value;
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as OtpCookieValue;
    if (
      !v ||
      typeof v.code !== "string" ||
      typeof v.key !== "string" ||
      typeof v.exp !== "number"
    )
      return null;
    return v;
  } catch {
    return null;
  }
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function setOtpChallenge(
  purpose: OtpPurpose,
  key: string,
  code: string,
): Promise<void> {
  const exp = Date.now() + OTP_TTL_SEC * 1000;
  const payload: OtpCookieValue = { purpose, key, code, exp };
  (await cookies()).set(COOKIE_OTP, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OTP_TTL_SEC,
    path: "/",
  });
}

export async function verifyOtpChallenge(
  purpose: OtpPurpose,
  key: string,
  otp: string,
): Promise<boolean> {
  const v = await readOtp();
  if (!v || v.purpose !== purpose || v.key !== key) return false;
  const store = await cookies();
  if (Date.now() > v.exp) {
    store.delete(COOKIE_OTP);
    return false;
  }
  const ok = v.code === otp.trim();
  if (ok) store.delete(COOKIE_OTP);
  return ok;
}

export async function clearOtpChallenge(): Promise<void> {
  (await cookies()).delete(COOKIE_OTP);
}

export async function setForgotVerifiedKey(key: string): Promise<void> {
  const exp = Date.now() + OTP_TTL_SEC * 1000;
  (await cookies()).set(
    COOKIE_FORGOT_OK,
    JSON.stringify({ key, exp } satisfies { key: string; exp: number }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: OTP_TTL_SEC,
      path: "/",
    },
  );
}

export async function readForgotVerifiedKey(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE_FORGOT_OK)?.value;
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { key?: string; exp?: number };
    if (!v?.key || typeof v.exp !== "number") return null;
    const store = await cookies();
    if (Date.now() > v.exp) {
      store.delete(COOKIE_FORGOT_OK);
      return null;
    }
    return v.key;
  } catch {
    return null;
  }
}

export async function clearForgotVerified(): Promise<void> {
  (await cookies()).delete(COOKIE_FORGOT_OK);
}
