import { NyayLogoLink } from "@/components/nyay-logo-link";
import { AuthHeroPanel } from "@/components/auth/auth-hero-panel";

type AuthSplitPageProps = {
  heroTitle: string;
  heroSubtitle: string;
  logoHref?: string;
  children: React.ReactNode;
};

export function AuthSplitPage({
  heroTitle,
  heroSubtitle,
  logoHref = "/login",
  children,
}: AuthSplitPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 lg:grid lg:min-h-0 lg:grid-cols-[1.05fr_minmax(0,440px)] lg:items-stretch lg:gap-10 xl:gap-14">
      <div className="order-2 lg:order-1 lg:flex lg:min-h-[480px] lg:flex-col">
        <AuthHeroPanel title={heroTitle} subtitle={heroSubtitle} />
      </div>

      <div className="order-1 flex flex-col justify-center lg:order-2 lg:py-2">
        <div className="mb-4 flex justify-center lg:mb-5 lg:justify-start">
          <NyayLogoLink
            href={logoHref}
            className="scale-[0.92] sm:scale-95 lg:scale-100"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
