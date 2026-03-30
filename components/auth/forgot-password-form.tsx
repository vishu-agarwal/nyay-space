"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import type { AuthFieldKey, AuthFormState } from "@/app/(auth)/actions";
import {
  forgotSendOtp,
  forgotSetPassword,
  forgotVerifyOtp,
} from "@/app/(auth)/actions";
import { AuthCard } from "@/components/auth/auth-card";
import {
  canSubmitForgotStep1,
  canSubmitForgotStep2,
  canSubmitForgotStep3,
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

type Step = 1 | 2 | 3;

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>(1);
  const [storedIdentifier, setStoredIdentifier] = useState("");
  const [sendOtpMessage, setSendOtpMessage] = useState<string | null>(null);

  const [sendState, sendAction, sendPending] = useActionState(
    forgotSendOtp,
    initial,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    forgotVerifyOtp,
    initial,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    forgotSetPassword,
    initial,
  );

  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");

  const s1Can = canSubmitForgotStep1(forgotIdentifier);
  const canVerify = canSubmitForgotStep2(forgotOtp);
  const canReset = canSubmitForgotStep3(forgotNewPassword, forgotConfirm);

  const [dismissed, setDismissed] = useState<
    Partial<Record<AuthFieldKey, boolean>>
  >({});

  const clearDismiss = useCallback(() => setDismissed({}), []);
  const dismissField = useCallback((key: AuthFieldKey) => {
    setDismissed((d) => ({ ...d, [key]: true }));
  }, []);

  useEffect(() => {
    if (!sendState.success) return;
    queueMicrotask(() => {
      const msg = sendState.success;
      if (!msg) return;
      const v =
        step === 1 ? forgotIdentifier.trim() : storedIdentifier;
      if (v) setStoredIdentifier(v);
      setSendOtpMessage(msg);
      setStep(2);
    });
    // Values read at the moment server reports success.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendState.success]);

  useEffect(() => {
    if (!verifyState.success) return;
    queueMicrotask(() => setStep(3));
  }, [verifyState.success]);

  const sendIdentifierErr =
    sendState.fieldErrors?.identifier && !dismissed.identifier
      ? sendState.fieldErrors.identifier
      : null;
  const verifyOtpErr =
    verifyState.fieldErrors?.otp && !dismissed.otp
      ? verifyState.fieldErrors.otp
      : null;
  const resetNewErr =
    resetState.fieldErrors?.newPassword && !dismissed.newPassword
      ? resetState.fieldErrors.newPassword
      : null;
  const resetConfirmErr =
    resetState.fieldErrors?.confirm && !dismissed.confirm
      ? resetState.fieldErrors.confirm
      : null;

  return (
    <AuthCard
      title="Reset password"
      description="Use the email or mobile number on your account. We will verify with a 6-digit code, then you can set a new password."
    >
      <ol className="mb-5 flex gap-2 text-xs font-medium text-nyay-muted">
        <li
          className={
            step >= 1
              ? "text-nyay-trust dark:text-foreground"
              : undefined
          }
        >
          1. Send code
        </li>
        <li aria-hidden>·</li>
        <li
          className={
            step >= 2
              ? "text-nyay-trust dark:text-foreground"
              : undefined
          }
        >
          2. Verify OTP
        </li>
        <li aria-hidden>·</li>
        <li
          className={
            step >= 3
              ? "text-nyay-trust dark:text-foreground"
              : undefined
          }
        >
          3. New password
        </li>
      </ol>

      <form
        id="forgot-send-otp"
        action={sendAction}
        className="space-y-5"
        noValidate
        onSubmit={clearDismiss}
      >
        {sendState.error ? (
          <p
            className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-900 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-100"
            role="alert"
          >
            {sendState.error}
          </p>
        ) : null}
        {step === 1 ? (
          <div className="space-y-2">
            <label
              htmlFor="forgot-identifier"
              className="block text-sm font-medium text-nyay-trust dark:text-foreground"
            >
              Email or mobile number
            </label>
            <input
              id="forgot-identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={forgotIdentifier}
              aria-invalid={sendIdentifierErr ? true : undefined}
              aria-describedby={
                sendIdentifierErr ? "forgot-identifier-error" : undefined
              }
              onChange={(e) => {
                dismissField("identifier");
                setForgotIdentifier(e.target.value);
              }}
              className={`${inputBase} ${sendIdentifierErr ? inputErr : inputOk}`}
              placeholder="you@example.com or +91 98765 43210"
            />
            {sendIdentifierErr ? (
              <p
                id="forgot-identifier-error"
                className="text-sm text-red-700 dark:text-red-300"
                role="alert"
              >
                {sendIdentifierErr}
              </p>
            ) : null}
          </div>
        ) : (
          <input type="hidden" name="identifier" value={storedIdentifier} />
        )}

        {step === 1 ? (
          <button
            type="submit"
            disabled={sendPending || !s1Can}
            title={
              !s1Can && !sendPending
                ? "Enter a valid email or mobile number (10+ digits)."
                : undefined
            }
            className="w-full cursor-pointer rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
          >
            {sendPending ? "Sending…" : "Send OTP"}
          </button>
        ) : null}
      </form>

      {step >= 2 ? (
        <div className="mt-8 space-y-5 border-t border-nyay-border pt-8 dark:border-white/10">
          {step === 2 ? (
            <>
              <p className="text-sm text-nyay-muted">
                Code sent to{" "}
                <span className="font-medium text-nyay-trust dark:text-foreground">
                  {storedIdentifier}
                </span>
                . Enter the 6-digit OTP below.
              </p>
              {sendOtpMessage ? (
                <p
                  className="rounded-lg border border-nyay-authority/35 bg-nyay-authority-soft px-3 py-2 text-sm text-nyay-authority-fg dark:border-nyay-authority/40 dark:bg-nyay-authority/15 dark:text-nyay-authority-foreground"
                  role="status"
                >
                  {sendOtpMessage}
                </p>
              ) : null}
              {verifyState.success ? (
                <p
                  className="rounded-lg border border-nyay-authority/35 bg-nyay-authority-soft px-3 py-2 text-sm text-nyay-authority-fg dark:border-nyay-authority/40 dark:bg-nyay-authority/15 dark:text-nyay-authority-foreground"
                  role="status"
                >
                  {verifyState.success}
                </p>
              ) : null}
              <form
                action={verifyAction}
                className="space-y-5"
                noValidate
                onSubmit={clearDismiss}
              >
                {verifyState.error ? (
                  <p
                    className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-900 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-100"
                    role="alert"
                  >
                    {verifyState.error}
                  </p>
                ) : null}
                <input
                  type="hidden"
                  name="identifier"
                  value={storedIdentifier}
                />
                <div className="space-y-2">
                  <label
                    htmlFor="forgot-otp"
                    className="block text-sm font-medium text-nyay-trust dark:text-foreground"
                  >
                    6-digit code
                  </label>
                  <input
                    id="forgot-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="\d{6}"
                    value={forgotOtp}
                    aria-invalid={verifyOtpErr ? true : undefined}
                    aria-describedby={
                      verifyOtpErr ? "forgot-otp-error" : undefined
                    }
                    onChange={(e) => {
                      dismissField("otp");
                      setForgotOtp(e.target.value);
                    }}
                    className={`${inputBase} tracking-widest ${verifyOtpErr ? inputErr : inputOk}`}
                    placeholder="000000"
                  />
                  {verifyOtpErr ? (
                    <p
                      id="forgot-otp-error"
                      className="text-sm text-red-700 dark:text-red-300"
                      role="alert"
                    >
                      {verifyOtpErr}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={verifyPending || !canVerify}
                    title={
                      !canVerify && !verifyPending
                        ? "Enter the 6-digit code."
                        : undefined
                    }
                    className="sm:flex-1 cursor-pointer rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
                  >
                    {verifyPending ? "Verifying…" : "Verify OTP"}
                  </button>
                  <button
                    type="submit"
                    form="forgot-send-otp"
                    disabled={sendPending || !storedIdentifier}
                    className="sm:flex-1 cursor-pointer rounded-lg border border-nyay-border bg-transparent px-4 py-2.5 text-sm font-semibold text-nyay-trust-mid transition hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:text-nyay-trust-soft dark:hover:bg-white/5"
                  >
                    {sendPending ? "Sending…" : "Resend OTP"}
                  </button>
                </div>
              </form>
              <button
                type="button"
                className="text-xs font-medium text-nyay-muted underline-offset-2 hover:text-nyay-trust hover:underline dark:hover:text-foreground"
                onClick={() => {
                  setStep(1);
                  setStoredIdentifier("");
                  setSendOtpMessage(null);
                  setForgotIdentifier("");
                  setForgotOtp("");
                }}
              >
                Use a different email or number
              </button>
            </>
          ) : null}

          {step === 3 ? (
            <form
              action={resetAction}
              className="space-y-5"
              noValidate
              onSubmit={clearDismiss}
            >
              {resetState.error ? (
                <p
                  className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-900 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-100"
                  role="alert"
                >
                  {resetState.error}
                </p>
              ) : null}
              <input
                type="hidden"
                name="identifier"
                value={storedIdentifier}
              />
              <div className="space-y-2">
                <label
                  htmlFor="forgot-new-password"
                  className="block text-sm font-medium text-nyay-trust dark:text-foreground"
                >
                  New password
                </label>
                <input
                  id="forgot-new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={forgotNewPassword}
                  aria-invalid={resetNewErr ? true : undefined}
                  aria-describedby={
                    resetNewErr ? "forgot-new-password-error" : undefined
                  }
                  onChange={(e) => {
                    dismissField("newPassword");
                    setForgotNewPassword(e.target.value);
                  }}
                  className={`${inputBase} ${resetNewErr ? inputErr : inputOk}`}
                  placeholder="At least 8 characters"
                />
                {resetNewErr ? (
                  <p
                    id="forgot-new-password-error"
                    className="text-sm text-red-700 dark:text-red-300"
                    role="alert"
                  >
                    {resetNewErr}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="forgot-confirm-password"
                  className="block text-sm font-medium text-nyay-trust dark:text-foreground"
                >
                  Confirm new password
                </label>
                <input
                  id="forgot-confirm-password"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={forgotConfirm}
                  aria-invalid={resetConfirmErr ? true : undefined}
                  aria-describedby={
                    resetConfirmErr ? "forgot-confirm-error" : undefined
                  }
                  onChange={(e) => {
                    dismissField("confirm");
                    setForgotConfirm(e.target.value);
                  }}
                  className={`${inputBase} ${resetConfirmErr ? inputErr : inputOk}`}
                  placeholder="Repeat new password"
                />
                {resetConfirmErr ? (
                  <p
                    id="forgot-confirm-error"
                    className="text-sm text-red-700 dark:text-red-300"
                    role="alert"
                  >
                    {resetConfirmErr}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={resetPending || !canReset}
                title={
                  !canReset && !resetPending
                    ? "Enter matching passwords (8+ characters)."
                    : undefined
                }
                className="w-full cursor-pointer rounded-lg bg-nyay-trust px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority disabled:cursor-not-allowed disabled:opacity-60 dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
              >
                {resetPending ? "Saving…" : "Update password"}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}

      <p className="mt-6 text-center text-sm text-nyay-muted">
        <Link href="/login" className={linkSm}>
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
