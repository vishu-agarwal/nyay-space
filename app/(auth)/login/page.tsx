import type { Metadata } from "next";
import { AuthSplitPage } from "@/components/auth/auth-split-page";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthSplitPage
      logoHref="/login"
      heroImage="/login_image.png"
      heroTitle="Your practice, one calm workspace"
      heroSubtitle="Track hearings, clients, and case papers without the clutter—built for advocates who prefer clarity over chaos."
    >
      <LoginForm />
    </AuthSplitPage>
  );
}
