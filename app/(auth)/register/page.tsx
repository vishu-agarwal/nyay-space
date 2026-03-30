import type { Metadata } from "next";
import { AuthSplitPage } from "@/components/auth/auth-split-page";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthSplitPage
      logoHref="/register"
      heroImage="/signup_image.png"
      heroTitle="Start strong from day one"
      heroSubtitle="Create your Nyay Space profile and keep cases, deadlines, and client work organized from the first matter you open."
    >
      <RegisterForm />
    </AuthSplitPage>
  );
}
