"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  contactIdentifierOk,
  emailOk,
  otpOk,
  passwordOk,
  whatsappDigitsOk,
} from "@/lib/auth-validation";

type PasswordLoginFields = { identifier: string; password: string };

function readPasswordLogin(form: HTMLFormElement): PasswordLoginFields {
  const identifier = String(
    (form.elements.namedItem("identifier") as HTMLInputElement)?.value ?? "",
  ).trim();
  const password = String(
    (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "",
  );
  return { identifier, password };
}

function readIdentifier(form: HTMLFormElement): string {
  return String(
    (form.elements.namedItem("identifier") as HTMLInputElement)?.value ?? "",
  ).trim();
}

function readOtp(form: HTMLFormElement): string {
  return String(
    (form.elements.namedItem("otp") as HTMLInputElement)?.value ?? "",
  ).trim();
}

type RegisterFields = {
  name: string;
  email: string;
  whatsapp: string;
  password: string;
  confirm: string;
  otp: string;
};

function readRegister(form: HTMLFormElement): RegisterFields {
  const name = String(
    (form.elements.namedItem("name") as HTMLInputElement)?.value ?? "",
  ).trim();
  const email = String(
    (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "",
  ).trim();
  const whatsapp = String(
    (form.elements.namedItem("whatsapp") as HTMLInputElement)?.value ?? "",
  ).trim();
  const password = String(
    (form.elements.namedItem("password") as HTMLInputElement)?.value ?? "",
  );
  const confirm = String(
    (form.elements.namedItem("confirm") as HTMLInputElement)?.value ?? "",
  );
  const otp = String(
    (form.elements.namedItem("otp") as HTMLInputElement)?.value ?? "",
  ).trim();
  return { name, email, whatsapp, password, confirm, otp };
}

function readForgotStep1(form: HTMLFormElement): { identifier: string } {
  return { identifier: readIdentifier(form) };
}

function readForgotStep2(form: HTMLFormElement): {
  identifier: string;
  otp: string;
} {
  return { identifier: readIdentifier(form), otp: readOtp(form) };
}

function readForgotStep3(form: HTMLFormElement): {
  identifier: string;
  newPassword: string;
  confirm: string;
} {
  const newPassword = String(
    (form.elements.namedItem("newPassword") as HTMLInputElement)?.value ?? "",
  );
  const confirm = String(
    (form.elements.namedItem("confirm") as HTMLInputElement)?.value ?? "",
  );
  return { identifier: readIdentifier(form), newPassword, confirm };
}

export function useLoginPasswordCanSubmit() {
  const formRef = useRef<HTMLFormElement>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const sync = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const { identifier, password } = readPasswordLogin(form);
    setCanSubmit(
      contactIdentifierOk(identifier) && passwordOk(password),
    );
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
  }, [sync]);

  return { formRef, canSubmit, sync };
}

export function useLoginOtpSendCanSubmit() {
  const formRef = useRef<HTMLFormElement>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const sync = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    setCanSubmit(contactIdentifierOk(readIdentifier(form)));
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
  }, [sync]);

  return { formRef, canSubmit, sync };
}

export function useLoginOtpVerifyCanSubmit(identifierReady: boolean) {
  const formRef = useRef<HTMLFormElement>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const sync = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const otp = readOtp(form);
    setCanSubmit(identifierReady && otpOk(otp));
  }, [identifierReady]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
  }, [sync]);

  return { formRef, canSubmit, sync };
}

export function useRegisterFormCanSubmit() {
  const formRef = useRef<HTMLFormElement>(null);
  const [canSendOtp, setCanSendOtp] = useState(false);
  const [canCreateAccount, setCanCreateAccount] = useState(false);

  const sync = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const { name, email, whatsapp, password, confirm, otp } = readRegister(
      form,
    );
    const base =
      name.length > 0 &&
      emailOk(email) &&
      whatsappDigitsOk(whatsapp) &&
      passwordOk(password) &&
      password === confirm;
    setCanSendOtp(base);
    setCanCreateAccount(base && otpOk(otp));
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
  }, [sync]);

  return { formRef, canSendOtp, canCreateAccount, sync };
}

export function useForgotStep1CanSubmit() {
  const formRef = useRef<HTMLFormElement>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const sync = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    setCanSubmit(contactIdentifierOk(readForgotStep1(form).identifier));
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
  }, [sync]);

  return { formRef, canSubmit, sync };
}

export function useForgotStep2CanSubmit() {
  const formRef = useRef<HTMLFormElement>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const sync = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const { otp } = readForgotStep2(form);
    setCanSubmit(otpOk(otp));
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
  }, [sync]);

  return { formRef, canSubmit, sync };
}

export function useForgotStep3CanSubmit() {
  const formRef = useRef<HTMLFormElement>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const sync = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const { newPassword, confirm } = readForgotStep3(form);
    setCanSubmit(
      passwordOk(newPassword) && newPassword === confirm && newPassword.length > 0,
    );
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
  }, [sync]);

  return { formRef, canSubmit, sync };
}
