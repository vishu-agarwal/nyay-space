"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import type { AuthFieldKey, AuthFormState } from "@/app/(auth)/actions";
import { registerFlow } from "@/app/(auth)/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { registerSubmitRules } from "@/components/auth/use-auth-form-sync";
import { saveAdvocateProfile } from "@/lib/advocate-profile";

const initial: AuthFormState = {};

const inputBase =
  "w-full rounded-lg border bg-nyay-canvas/50 px-3 py-2.5 text-sm text-nyay-trust outline-none transition placeholder:text-nyay-muted focus:ring-2 focus:ring-nyay-authority/30 dark:border-white/15 dark:bg-white/5 dark:text-foreground dark:focus:border-nyay-trust-soft";

const inputOk =
  "border-nyay-border focus:border-nyay-trust-mid dark:focus:border-nyay-trust-soft";

const inputErr =
  "border-red-400 focus:border-red-500 focus:ring-red-500/25 dark:border-red-500/50 dark:focus:border-red-400";

const linkSm =
  "cursor-pointer font-medium text-nyay-trust-mid underline-offset-2 hover:text-nyay-trust hover:underline dark:text-nyay-trust-soft";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerFlow, initial);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const { canSendOtp, canCreateAccount } = registerSubmitRules({
    name,
    email,
    whatsapp,
    password,
    confirm,
    otp,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [codeHint, setCodeHint] = useState<string | null>(null);

  const [dismissed, setDismissed] = useState<
    Partial<Record<AuthFieldKey, boolean>>
  >({});

  const clearDismiss = useCallback(() => setDismissed({}), []);
  const dismissField = useCallback((key: AuthFieldKey) => {
    setDismissed((d) => ({ ...d, [key]: true }));
  }, []);

  useEffect(() => {
    if (state.success) {
      setOtpSent(true);
      setCodeHint(state.success);
    }
  }, [state.success]);

  const fe = state.fieldErrors;
  const nameErr = fe?.name && !dismissed.name ? fe.name : null;
  const whatsappErr =
    fe?.whatsapp && !dismissed.whatsapp ? fe.whatsapp : null;
  const emailErr = fe?.email && !dismissed.email ? fe.email : null;
  const passwordErr =
    fe?.password && !dismissed.password ? fe.password : null;
  const confirmErr =
    fe?.confirm && !dismissed.confirm ? fe.confirm : null;
  const otpErr = fe?.otp && !dismissed.otp ? fe.otp : null;

  return (
    <AuthCard
      title="Create account"
      description="Email and mobile for verification; then choose a secure password."
    >
      <form
        action={formAction}
        className="space-y-5"
        noValidate
        onSubmit={(e) => {
          clearDismiss();
          const fd = new FormData(e.currentTarget);
          const intent = String(fd.get("intent") ?? "");
          if (intent === "send" || intent === "resend" || intent === "create") {
            saveAdvocateProfile({
              name: name.trim() || "",
              whatsapp: whatsapp.trim(),
            });
          }
        }}
      >
        {state.error ? (
          <p
            className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-900 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            {state.error}
          </p>
        ) : null}

        {codeHint ? (
          <p
            className="rounded-lg border border-nyay-authority/35 bg-nyay-authority-soft px-3 py-2 text-sm text-nyay-authority-fg dark:border-nyay-authority/40 dark:bg-nyay-authority/15 dark:text-nyay-authority-foreground"
            role="status"
          >
            {codeHint}
          </p>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-nyay-trust dark:text-foreground"
          >
            Full name
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            aria-invalid={nameErr ? true : undefined}
            aria-describedby={nameErr ? "register-name-error" : undefined}
            onChange={(e) => {
              dismissField("name");
              setName(e.target.value);
            }}
            className={`${inputBase} ${nameErr ? inputErr : inputOk}`}
            placeholder="Advocate name"
          />
          {nameErr ? (
            <p
              id="register-name-error"
              className="text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {nameErr}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-whatsapp"
            className="block text-sm font-medium text-nyay-trust dark:text-foreground"
          >
            Mobile / WhatsApp number
          </label>
          <input
            id="register-whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            value={whatsapp}
            aria-invalid={whatsappErr ? true : undefined}
            aria-describedby={
              whatsappErr
                ? "register-whatsapp-hint register-whatsapp-error"
                : "register-whatsapp-hint"
            }
            onChange={(e) => {
              dismissField("whatsapp");
              setWhatsapp(e.target.value);
            }}
            className={`${inputBase} ${whatsappErr ? inputErr : inputOk}`}
            placeholder="+91 98765 43210"
          />
          <p
            id="register-whatsapp-hint"
            className="text-xs text-nyay-muted"
          >
            Used for OTP and contact templates (stored in this browser until you connect a backend).
          </p>
          {whatsappErr ? (
            <p
              id="register-whatsapp-error"
              className="text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {whatsappErr}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-nyay-trust dark:text-foreground"
          >
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={emailErr ? true : undefined}
            aria-describedby={emailErr ? "register-email-error" : undefined}
            onChange={(e) => {
              dismissField("email");
              setEmail(e.target.value);
            }}
            className={`${inputBase} ${emailErr ? inputErr : inputOk}`}
            placeholder="you@example.com"
          />
          {emailErr ? (
            <p
              id="register-email-error"
              className="text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {emailErr}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-nyay-trust dark:text-foreground"
          >
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            aria-invalid={passwordErr ? true : undefined}
            aria-describedby={
              passwordErr ? "register-password-error" : undefined
            }
            onChange={(e) => {
              dismissField("password");
              setPassword(e.target.value);
            }}
            className={`${inputBase} ${passwordErr ? inputErr : inputOk}`}
            placeholder="At least 8 characters"
          />
          {passwordErr ? (
            <p
              id="register-password-error"
              className="text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {passwordErr}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="register-confirm"
            className="block text-sm font-medium text-nyay-trust dark:text-foreground"
          >
            Confirm password
          </label>
          <input
            id="register-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            aria-invalid={confirmErr ? true : undefined}
            aria-describedby={confirmErr ? "register-confirm-error" : undefined}
            onChange={(e) => {
              dismissField("confirm");
              setConfirm(e.target.value);
            }}
            className={`${inputBase} ${confirmErr ? inputErr : inputOk}`}
            placeholder="Repeat password"
          />
          {confirmErr ? (
            <p
              id="register-confirm-error"
              className="text-sm text-red-700 dark:text-red-300"
              role="alert"
            >
              {confirmErr}
            </p>
          ) : null}
        </div>

        {otpSent ? (
          <div className="space-y-2">
            <label
              htmlFor="register-otp"
              className="block text-sm font-medium text-nyay-trust dark:text-foreground"
            >
              6-digit verification code
            </label>
            <input
              id="register-otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="\d{6}"
              value={otp}
              aria-invalid={otpErr ? true : undefined}
              aria-describedby={otpErr ? "register-otp-error" : undefined}
              onChange={(e) => {
                dismissField("otp");
                setOtp(e.target.value);
              }}
              className={`${inputBase} tracking-widest ${otpErr ? inputErr : inputOk}`}
              placeholder="000000"
            />
            {otpErr ? (
              <p
                id="register-otp-error"
                className="text-sm text-red-700 dark:text-red-300"
                role="alert"
              >
                {otpErr}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {!otpSent ? (
            <button
              type="submit"
              name="intent"
              value="send"
              disabled={pending || !canSendOtp}
              title={
                !canSendOtp && !pending
                  ? "Fill name, valid email, mobile (10+ digits), and matching passwords first."
                  : undefined
              }
              className="w-full cursor-pointer rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
            >
              {pending ? "Sending…" : "Send verification code"}
            </button>
          ) : (
            <>
              <button
                type="submit"
                name="intent"
                value="create"
                disabled={pending || !canCreateAccount}
                title={
                  !canCreateAccount && !pending
                    ? "Enter the 6-digit code and ensure all fields are valid."
                    : undefined
                }
                className="w-full cursor-pointer rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
              >
                {pending ? "Creating account…" : "Create account"}
              </button>
              <button
                type="submit"
                name="intent"
                value="resend"
                disabled={pending || !canSendOtp}
                className="w-full cursor-pointer rounded-lg border border-nyay-border bg-transparent px-4 py-2.5 text-sm font-semibold text-nyay-trust-mid transition hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-nyay-trust-soft dark:hover:bg-white/5"
              >
                {pending ? "Sending…" : "Resend OTP"}
              </button>
            </>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-nyay-muted">
        Already have an account?{" "}
        <Link href="/login" className={linkSm}>
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
