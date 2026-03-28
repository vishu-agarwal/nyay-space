import type { Metadata } from "next";
import { AuthSplitPage } from "@/components/auth/auth-split-page";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplitPage
      logoHref="/login"
      heroTitle="Back on track, securely"
      heroSubtitle="Reset your password and return to managing matters, hearings, and clients with confidence."
    >
      <ForgotPasswordForm />
    </AuthSplitPage>
  );
}
