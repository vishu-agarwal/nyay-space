type AuthHeroPanelProps = {
  title: string;
  subtitle: string;
};

/** Court & practice illustration — line art only, matches auth panel palette. */
function CasePracticeIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Courthouse façade — columns + pediment */}
      <path
        d="M48 312 V188 H472 V312"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M140 188 V102 L260 58 L380 102 V188"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M140 102 L380 102"
        stroke="rgba(201,162,39,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M88 312 V200 H132 V312 M168 312 V200 H212 V312 M308 312 V200 H352 V312 M388 312 V200 H432 V312"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2"
      />
      <path
        d="M88 200 H432"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1.5"
      />

      {/* Scales of justice — on the column line, below pediment */}
      <path
        d="M260 298 V196"
        stroke="rgba(255,255,255,0.38)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M200 200 H320"
        stroke="rgba(255,255,255,0.38)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M220 200 L200 276 H248 L260 200"
        stroke="rgba(201,162,39,0.55)"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="rgba(201,162,39,0.07)"
      />
      <path
        d="M300 200 L280 276 H328 L320 200"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse
        cx="214"
        cy="284"
        rx="28"
        ry="8"
        stroke="rgba(201,162,39,0.48)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="306"
        cy="284"
        rx="28"
        ry="8"
        stroke="rgba(255,255,255,0.26)"
        strokeWidth="1.5"
      />
      <path
        d="M252 298 L268 298"
        stroke="rgba(201,162,39,0.4)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Gavel + block — court / hearing */}
      <path
        d="M392 268 L448 224"
        stroke="rgba(201,162,39,0.5)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M448 224 L462 238"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M368 292 H428 V304 H368 Z"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Advocate briefs / case papers */}
      <path
        d="M72 278 L72 168 L188 142 L188 252 Z"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M92 288 L92 178 L208 152 L208 262 Z"
        fill="rgba(201,162,39,0.1)"
        stroke="rgba(201,162,39,0.42)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M112 298 L112 188 L228 162 L228 272 Z"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.26)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M128 210 L200 192 M128 228 L188 214 M128 246 L176 236"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Open law book */}
      <path
        d="M320 312 L320 248 L396 232 L396 312 M396 248 L452 262 L452 312"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M320 248 L396 232 L452 262"
        stroke="rgba(201,162,39,0.32)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M332 268 H388 M332 284 H382 M408 276 H438 M408 292 H434"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Hearing clock — subtle */}
      <circle cx="118" cy="118" r="28" stroke="rgba(201,162,39,0.3)" strokeWidth="2" />
      <path
        d="M118 98 V118 L132 128"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthHeroPanel({ title, subtitle }: AuthHeroPanelProps) {
  return (
    <div className="relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-nyay-trust via-[#15365c] to-[#0c1f36] p-6 shadow-[var(--nyay-elevate)] sm:min-h-[260px] sm:p-8 lg:min-h-0 lg:flex-1 lg:justify-between lg:p-10 dark:from-[#0e1f38] dark:via-[#152f52] dark:to-[#0a1628]">
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
        <div className="relative z-[1] mt-4 text-center lg:mt-8 lg:text-left">
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
