"use client";

import {
  contactIdentifierOk,
  emailOk,
  otpOk,
  passwordOk,
  whatsappDigitsOk,
} from "@/lib/auth-validation";

export function canSubmitLoginPassword(identifier: string, password: string) {
  return contactIdentifierOk(identifier.trim()) && passwordOk(password);
}

export function canSubmitLoginOtpSend(identifier: string) {
  return contactIdentifierOk(identifier.trim());
}

export function canSubmitLoginOtpVerify(identifierReady: boolean, otp: string) {
  return identifierReady && otpOk(otp.trim());
}

export type RegisterFormFields = {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  confirm: string;
  otp: string;
};

export function registerSubmitRules(fields: RegisterFormFields) {
  const { name, email, whatsapp, password, confirm, otp } = fields;
  const base =
    name.trim().length > 0 &&
    emailOk(email.trim()) &&
    whatsappDigitsOk(whatsapp.trim()) &&
    passwordOk(password) &&
    password === confirm;
  const canSendOtp = base;
  const canCreateAccount = base && otpOk(otp.trim());
  return { canSendOtp, canCreateAccount };
}

export function canSubmitForgotStep1(identifier: string) {
  return contactIdentifierOk(identifier.trim());
}

export function canSubmitForgotStep2(otp: string) {
  return otpOk(otp.trim());
}

export function canSubmitForgotStep3(newPassword: string, confirm: string) {
  return (
    passwordOk(newPassword) &&
    newPassword === confirm &&
    newPassword.length > 0
  );
}
