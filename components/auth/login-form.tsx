"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import type { AuthFieldKey, AuthFormState } from "@/app/(auth)/actions";
import {
  loginSendOtp,
  loginVerifyOtp,
  signIn,
} from "@/app/(auth)/actions";
import { AuthCard } from "@/components/auth/auth-card";
import {
  canSubmitLoginOtpSend,
  canSubmitLoginOtpVerify,
  canSubmitLoginPassword,
} from "@/components/auth/use-auth-form-sync";

const initial: AuthFormState = {};

const inputBase =
  "w-full rounded-lg border bg-nyay-canvas/50 px-3 py-2.5 text-sm text-nyay-trust outline-none transition placeholder:text-nyay-muted focus:ring-2 focus:ring-nyay-authority/30 dark:border-white/15 dark:bg-white/5 dark:text-foreground dark:focus:border-nyay-trust-soft";

const inputOk =
  "border-nyay-border focus:border-nyay-trust-mid dark:focus:border-nyay-trust-soft";

const inputErr =
  "border-red-400 focus:border-red-500 focus:ring-red-500/25 dark:border-red-500/50 dark:focus:border-red-400";

const linkSm =
  "cursor-pointer font-medium text-nyay-trust-mid underline-offset-2 hover:text-nyay-trust hover:underline dark:text-nyay-trust-soft";

const linkXs = `cursor-pointer text-xs font-medium text-nyay-trust-mid underline-offset-2 hover:text-nyay-trust hover:underline dark:text-nyay-trust-soft`;

const tabBase =
  "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority";
const tabActive =
  "bg-nyay-trust text-white shadow-sm dark:bg-nyay-trust-mid";
const tabIdle =
  "text-nyay-trust-mid hover:bg-nyay-canvas dark:text-foreground/80 dark:hover:bg-white/5";

type SignInMode = "password" | "otp";

export function LoginForm() {
  const [mode, setMode] = useState<SignInMode>("password");
  const [otpSent, setOtpSent] = useState(false);
  const [storedIdentifier, setStoredIdentifier] = useState("");
  const [otpSendMessage, setOtpSendMessage] = useState<string | null>(null);

  const [pwState, pwAction, pwPending] = useActionState(signIn, initial);
  const [sendState, sendAction, sendPending] = useActionState(
    loginSendOtp,
    initial,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    loginVerifyOtp,
    initial,
  );

  const [pwIdentifier, setPwIdentifier] = useState("");
  const [pwPassword, setPwPassword] = useState("");
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [verifyOtp, setVerifyOtp] = useState("");

  const canPw = canSubmitLoginPassword(pwIdentifier, pwPassword);
  const canSend = canSubmitLoginOtpSend(otpIdentifier);
  const canVerify = canSubmitLoginOtpVerify(
    Boolean(storedIdentifier.trim()),
    verifyOtp,
  );

  const [dismissed, setDismissed] = useState<
    Partial<Record<AuthFieldKey, boolean>>
  >({});

  const clearDismiss = useCallback(() => setDismissed({}), []);
  const dismissField = useCallback((key: AuthFieldKey) => {
    setDismissed((d) => ({ ...d, [key]: true }));
  }, []);

  useEffect(() => {
    if (!sendState.success) return;
    setStoredIdentifier(otpIdentifier.trim());
    setOtpSent(true);
    setOtpSendMessage(sendState.success);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- otpIdentifier from the success render only
  }, [sendState.success]);

  useEffect(() => {
    setOtpSent(false);
    setStoredIdentifier("");
    setOtpSendMessage(null);
    setDismissed({});
    setPwIdentifier("");
    setPwPassword("");
    setOtpIdentifier("");
    setVerifyOtp("");
  }, [mode]);

  const pwIdentifierErr =
    pwState.fieldErrors?.identifier && !dismissed.identifier
      ? pwState.fieldErrors.identifier
      : null;
  const pwPasswordErr =
    pwState.fieldErrors?.password && !dismissed.password
      ? pwState.fieldErrors.password
      : null;

  const sendIdentifierErr =
    sendState.fieldErrors?.identifier && !dismissed.identifier
      ? sendState.fieldErrors.identifier
      : null;
  const verifyOtpErr =
    verifyState.fieldErrors?.otp && !dismissed.otp
      ? verifyState.fieldErrors.otp
      : null;
  const verifyIdentifierErr =
    verifyState.fieldErrors?.identifier && !dismissed.identifier
      ? verifyState.fieldErrors.identifier
      : null;

  return (
    <AuthCard
      title="Sign in"
      description="Use your email or mobile number. Password or a one-time code."
    >
      <div
        className="mb-5 flex gap-1 rounded-xl border border-nyay-border bg-nyay-canvas/40 p-1 dark:border-white/10 dark:bg-white/5"
        role="tablist"
        aria-label="Sign-in method"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          className={`${tabBase} ${mode === "password" ? tabActive : tabIdle}`}
          onClick={() => setMode("password")}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "otp"}
          className={`${tabBase} ${mode === "otp" ? tabActive : tabIdle}`}
          onClick={() => setMode("otp")}
        >
          OTP
        </button>
      </div>

      {mode === "password" ? (
        <form
          action={pwAction}
          className="space-y-5"
          onSubmit={clearDismiss}
          noValidate
        >
          {pwState.error ? (
            <p
              className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-900 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-100"
              role="alert"
            >
              {pwState.error}
            </p>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="login-identifier"
              className="block text-sm font-medium text-nyay-trust dark:text-foreground"
            >
              Email or mobile number
            </label>
            <input
              id="login-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              inputMode="email"
              value={pwIdentifier}
              aria-invalid={pwIdentifierErr ? true : undefined}
              aria-describedby={
                pwIdentifierErr ? "login-identifier-error" : undefined
              }
              onChange={(e) => {
                dismissField("identifier");
                setPwIdentifier(e.target.value);
              }}
              className={`${inputBase} ${pwIdentifierErr ? inputErr : inputOk}`}
              placeholder="you@example.com or +91 98765 43210"
            />
            {pwIdentifierErr ? (
              <p
                id="login-identifier-error"
                className="text-sm text-red-700 dark:text-red-300"
                role="alert"
              >
                {pwIdentifierErr}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-nyay-trust dark:text-foreground"
              >
                Password
              </label>
              <Link href="/forgot-password" className={linkXs}>
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={pwPassword}
              aria-invalid={pwPasswordErr ? true : undefined}
              aria-describedby={
                pwPasswordErr ? "login-password-error" : undefined
              }
              onChange={(e) => {
                dismissField("password");
                setPwPassword(e.target.value);
              }}
              className={`${inputBase} ${pwPasswordErr ? inputErr : inputOk}`}
              placeholder="••••••••"
            />
            {pwPasswordErr ? (
              <p
                id="login-password-error"
                className="text-sm text-red-700 dark:text-red-300"
                role="alert"
              >
                {pwPasswordErr}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={pwPending || !canPw}
            title={
              !canPw && !pwPending
                ? "Enter a valid email or mobile (10+ digits) and password (8+ characters)."
                : undefined
            }
            className="w-full cursor-pointer rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
          >
            {pwPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <form
            id="login-send-otp"
            action={sendAction}
            className="space-y-5"
            onSubmit={clearDismiss}
            noValidate
          >
            {sendState.error ? (
              <p
                className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-900 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-100"
                role="alert"
              >
                {sendState.error}
              </p>
            ) : null}
            {otpSendMessage ? (
              <p
                className="rounded-lg border border-nyay-authority/35 bg-nyay-authority-soft px-3 py-2 text-sm text-nyay-authority-fg dark:border-nyay-authority/40 dark:bg-nyay-authority/15 dark:text-nyay-authority-foreground"
                role="status"
              >
                {otpSendMessage}
              </p>
            ) : null}

            <div className="space-y-2">
              <label
                htmlFor="login-otp-identifier"
                className="block text-sm font-medium text-nyay-trust dark:text-foreground"
              >
                Email or mobile number
              </label>
              <input
                id="login-otp-identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={otpIdentifier}
                aria-invalid={sendIdentifierErr ? true : undefined}
                aria-describedby={
                  sendIdentifierErr ? "login-otp-identifier-error" : undefined
                }
                onChange={(e) => {
                  dismissField("identifier");
                  setOtpIdentifier(e.target.value);
                }}
                className={`${inputBase} ${sendIdentifierErr ? inputErr : inputOk}`}
                placeholder="you@example.com or +91 98765 43210"
              />
              {sendIdentifierErr ? (
                <p
                  id="login-otp-identifier-error"
                  className="text-sm text-red-700 dark:text-red-300"
                  role="alert"
                >
                  {sendIdentifierErr}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={sendPending || !canSend}
              title={
                !canSend && !sendPending
                  ? "Enter a valid email or mobile number (10+ digits)."
                  : undefined
              }
              className="w-full cursor-pointer rounded-lg border border-nyay-border bg-nyay-surface px-4 py-2.5 text-sm font-semibold text-nyay-trust shadow-sm transition hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-nyay-surface dark:text-foreground dark:hover:bg-white/5"
            >
              {sendPending ? "Sending…" : "Send OTP"}
            </button>
          </form>

          {otpSent ? (
            <form
              action={verifyAction}
              className="space-y-5 border-t border-nyay-border pt-6 dark:border-white/10"
              onSubmit={clearDismiss}
              noValidate
            >
              {verifyState.error ? (
                <p
                  className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-900 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-100"
                  role="alert"
                >
                  {verifyState.error}
                </p>
              ) : null}
              <input type="hidden" name="identifier" value={storedIdentifier} />

              <div className="space-y-2">
                <label
                  htmlFor="login-otp"
                  className="block text-sm font-medium text-nyay-trust dark:text-foreground"
                >
                  6-digit code
                </label>
                <input
                  id="login-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="\d{6}"
                  value={verifyOtp}
                  aria-invalid={verifyOtpErr ? true : undefined}
                  aria-describedby={
                    verifyOtpErr ? "login-otp-error" : undefined
                  }
                  onChange={(e) => {
                    dismissField("otp");
                    setVerifyOtp(e.target.value);
                  }}
                  className={`${inputBase} tracking-widest ${verifyOtpErr ? inputErr : inputOk}`}
                  placeholder="000000"
                />
                {verifyOtpErr ? (
                  <p
                    id="login-otp-error"
                    className="text-sm text-red-700 dark:text-red-300"
                    role="alert"
                  >
                    {verifyOtpErr}
                  </p>
                ) : null}
                {verifyIdentifierErr ? (
                  <p className="text-sm text-red-700 dark:text-red-300" role="alert">
                    {verifyIdentifierErr}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={verifyPending || !canVerify}
                  title={
                    !canVerify && !verifyPending
                      ? "Enter the 6-digit code sent to you."
                      : undefined
                  }
                  className="sm:flex-1 cursor-pointer rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
                >
                  {verifyPending ? "Verifying…" : "Sign in with OTP"}
                </button>
                <button
                  type="submit"
                  form="login-send-otp"
                  disabled={sendPending || !canSend}
                  className="sm:flex-1 cursor-pointer rounded-lg border border-nyay-border bg-transparent px-4 py-2.5 text-sm font-semibold text-nyay-trust-mid transition hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-nyay-trust-soft dark:hover:bg-white/5"
                >
                  {sendPending ? "Sending…" : "Resend OTP"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-nyay-muted">
        No account?{" "}
        <Link href="/register" className={linkSm}>
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
