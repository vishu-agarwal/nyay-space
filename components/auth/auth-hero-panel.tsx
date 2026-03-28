type AuthHeroPanelProps = {
  title: string;
  subtitle: string;
};

/** Court & practice illustration — `public/icons/auth-case-practice-illustration.svg`. */
function CasePracticeIllustration({ className = "" }: { className?: string }) {
  return (
    <img
      src="/icons/auth-case-practice-illustration.svg"
      alt=""
      className={className}
      aria-hidden
    />
  );
}

export function AuthHeroPanel({ title, subtitle }: AuthHeroPanelProps) {
  return (
    <div className="relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-nyay-trust via-[#15365c] to-[#0c1f36] p-5 shadow-[var(--nyay-elevate)] sm:min-h-[260px] sm:p-6 lg:min-h-0 lg:flex-1 lg:justify-between lg:p-8 dark:from-[#0e1f38] dark:via-[#152f52] dark:to-[#0a1628]">
      <div
        className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full bg-nyay-authority/20 blur-3xl sm:h-72 sm:w-72"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-white/5 blur-3xl"
        aria-hidden
      />

      <div className="relative z-[1] flex flex-1 flex-col lg:min-h-[min(420px,50vh)]">
        <CasePracticeIllustration className="mx-auto mt-2 w-full max-w-[min(100%,320px)] opacity-95 sm:max-w-[380px] lg:mx-0 lg:mt-0 lg:max-w-none lg:flex-1" />
        <div className="relative z-[1] mt-3 text-center lg:mt-6 lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nyay-authority/90">
            Nyay Space
          </p>
          <h2 className="mt-2 text-balance text-xl font-semibold leading-snug text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-white/75 sm:text-base">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
