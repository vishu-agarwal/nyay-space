import { NyayLogoLink } from "@/components/nyay-logo-link";
import { AuthHeroPanel } from "@/components/auth/auth-hero-panel";

type AuthSplitPageProps = {
  heroTitle: string;
  heroSubtitle: string;
  /** Optional hero image path under `public/` (e.g. `/login_image.png`). */
  heroImage?: string;
  logoHref?: string;
  children: React.ReactNode;
};

export function AuthSplitPage({
  heroTitle,
  heroSubtitle,
  heroImage,
  logoHref = "/login",
  children,
}: AuthSplitPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 lg:grid lg:min-h-0 lg:grid-cols-2 lg:items-stretch lg:gap-6 xl:gap-8">
      <div className="order-2 hidden lg:order-1 lg:flex lg:min-h-[420px] lg:flex-col">
        <AuthHeroPanel
          title={heroTitle}
          subtitle={heroSubtitle}
          imageSrc={heroImage}
        />
      </div>

      <div className="order-1 flex flex-col justify-center lg:order-2 lg:w-full lg:py-0">
        <div className="mb-2 flex w-full justify-center text-center lg:mb-2">
          <NyayLogoLink
            href={logoHref}
            className="mx-auto scale-[0.90] sm:scale-95 lg:scale-100"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
