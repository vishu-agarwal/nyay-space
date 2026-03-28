"use server";

import { redirect } from "next/navigation";
import {
  contactIdentifierOk,
  emailOk,
  normalizeContactKey,
  otpOk,
  passwordOk,
  registerOtpKey,
  whatsappDigitsOk,
} from "@/lib/auth-validation";
import {
  clearForgotVerified,
  generateOtpCode,
  readForgotVerifiedKey,
  setForgotVerifiedKey,
  setOtpChallenge,
  verifyOtpChallenge,
} from "@/lib/server-otp-cookie";

export type AuthFieldKey =
  | "email"
  | "password"
  | "name"
  | "whatsapp"
  | "confirm"
  | "identifier"
  | "otp"
  | "newPassword";

export type AuthFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<AuthFieldKey, string>>;
};

function devLogOtp(label: string, code: string) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[nyay-space] ${label} (dev stub OTP): ${code}`);
  }
}

/** Password sign-in: email or mobile + password */
export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier)
    return { fieldErrors: { identifier: "Email or mobile number is required." } };
  if (!contactIdentifierOk(identifier)) {
    return {
      fieldErrors: {
        identifier: "Enter a valid email or a mobile number (at least 10 digits).",
      },
    };
  }
  if (!password)
    return { fieldErrors: { password: "Password is required." } };
  if (!passwordOk(password)) {
    return {
      fieldErrors: { password: "Password must be at least 8 characters." },
    };
  }

  // Replace with real authentication.
  redirect("/");
}

export async function loginSendOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  if (!identifier) {
    return { fieldErrors: { identifier: "Email or mobile number is required." } };
  }
  if (!contactIdentifierOk(identifier)) {
    return {
      fieldErrors: {
        identifier: "Enter a valid email or a mobile number (at least 10 digits).",
      },
    };
  }
  const key = normalizeContactKey(identifier);
  const code = generateOtpCode();
  await setOtpChallenge("login", key, code);
  devLogOtp("Login OTP", code);
  return {
    success:
      "We sent a 6-digit code to your email or mobile (stub until SMS/email is connected).",
  };
}

export async function loginVerifyOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!identifier)
    return { fieldErrors: { identifier: "Email or mobile number is required." } };
  if (!otpOk(otp))
    return { fieldErrors: { otp: "Enter the 6-digit code." } };

  const key = normalizeContactKey(identifier);
  const ok = await verifyOtpChallenge("login", key, otp);
  if (!ok) {
    return {
      fieldErrors: { otp: "Invalid or expired code. Request a new one." },
    };
  }

  redirect("/");
}

async function registerSendOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!name) return { fieldErrors: { name: "Name is required." } };
  if (!email) return { fieldErrors: { email: "Email is required." } };
  if (!emailOk(email))
    return { fieldErrors: { email: "Enter a valid email address." } };
  if (!whatsapp)
    return { fieldErrors: { whatsapp: "Mobile / WhatsApp number is required." } };
  if (!whatsappDigitsOk(whatsapp)) {
    return {
      fieldErrors: {
        whatsapp:
          "Enter a valid mobile number (at least 10 digits; include country code if needed).",
      },
    };
  }
  if (!password)
    return { fieldErrors: { password: "Password is required." } };
  if (!passwordOk(password)) {
    return {
      fieldErrors: { password: "Password must be at least 8 characters." },
    };
  }
  if (password !== confirm)
    return { fieldErrors: { confirm: "Passwords do not match." } };

  const key = registerOtpKey(email, whatsapp);
  const code = generateOtpCode();
  await setOtpChallenge("register", key, code);
  devLogOtp("Registration OTP", code);
  return {
    success:
      "Verification code sent to your email and mobile on file (stub). Enter it below.",
  };
}

export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const otp = String(formData.get("otp") ?? "").trim();

  if (!name) return { fieldErrors: { name: "Name is required." } };
  if (!email) return { fieldErrors: { email: "Email is required." } };
  if (!emailOk(email))
    return { fieldErrors: { email: "Enter a valid email address." } };
  if (!whatsapp)
    return { fieldErrors: { whatsapp: "Mobile / WhatsApp number is required." } };
  if (!whatsappDigitsOk(whatsapp)) {
    return {
      fieldErrors: {
        whatsapp:
          "Enter a valid mobile number (at least 10 digits; include country code if needed).",
      },
    };
  }
  if (!password)
    return { fieldErrors: { password: "Password is required." } };
  if (!passwordOk(password)) {
    return {
      fieldErrors: { password: "Password must be at least 8 characters." },
    };
  }
  if (password !== confirm)
    return { fieldErrors: { confirm: "Passwords do not match." } };
  if (!otpOk(otp))
    return { fieldErrors: { otp: "Enter the 6-digit verification code." } };

  const key = registerOtpKey(email, whatsapp);
  const ok = await verifyOtpChallenge("register", key, otp);
  if (!ok) {
    return {
      fieldErrors: {
        otp: "Invalid or expired code. Tap “Resend code” and try again.",
      },
    };
  }

  // Replace with account creation and sign-in.
  redirect("/");
}

/** Single form: send / resend code, or create account with OTP. */
export async function registerFlow(
  prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const intent = String(formData.get("intent") ?? "");
  if (intent === "send" || intent === "resend") {
    return registerSendOtp(prev, formData);
  }
  if (intent === "create") {
    return signUp(prev, formData);
  }
  return { error: "Invalid request." };
}

export async function forgotSendOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  if (!identifier) {
    return { fieldErrors: { identifier: "Email or mobile number is required." } };
  }
  if (!contactIdentifierOk(identifier)) {
    return {
      fieldErrors: {
        identifier: "Enter a valid email or a mobile number (at least 10 digits).",
      },
    };
  }
  await clearForgotVerified();
  const key = normalizeContactKey(identifier);
  const code = generateOtpCode();
  await setOtpChallenge("forgot", key, code);
  devLogOtp("Forgot password OTP", code);
  return {
    success:
      "We sent a 6-digit code to your email or mobile (stub). Enter it below to continue.",
  };
}

export async function forgotVerifyOtp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!identifier)
    return { fieldErrors: { identifier: "Email or mobile number is required." } };
  if (!otpOk(otp))
    return { fieldErrors: { otp: "Enter the 6-digit code." } };

  const key = normalizeContactKey(identifier);
  const ok = await verifyOtpChallenge("forgot", key, otp);
  if (!ok) {
    return {
      fieldErrors: { otp: "Invalid or expired code. Request a new one." },
    };
  }

  await setForgotVerifiedKey(key);
  return { success: "Verified. Enter and confirm your new password." };
}

export async function forgotSetPassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!identifier)
    return { fieldErrors: { identifier: "Email or mobile number is required." } };

  const key = normalizeContactKey(identifier);
  const verified = await readForgotVerifiedKey();
  if (verified !== key) {
    return {
      error: "Verification expired. Start again from step one.",
    };
  }

  if (!newPassword)
    return { fieldErrors: { newPassword: "New password is required." } };
  if (!passwordOk(newPassword)) {
    return {
      fieldErrors: {
        newPassword: "Password must be at least 8 characters.",
      },
    };
  }
  if (newPassword !== confirm)
    return { fieldErrors: { confirm: "Passwords do not match." } };

  await clearForgotVerified();
  // Replace with password update in your auth backend.
  redirect("/login?reset=success");
}
