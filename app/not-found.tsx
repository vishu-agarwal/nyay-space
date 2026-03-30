import Link from "next/link";
import { NyayLogoLink } from "@/components/nyay-logo-link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col bg-nyay-canvas">
      <header className="sticky top-0 z-40 border-b border-nyay-border/90 bg-nyay-surface/90 shadow-[0_1px_0_rgba(201,162,39,0.12)] backdrop-blur-md dark:bg-[color-mix(in_srgb,var(--nyay-surface)_92%,transparent)] dark:shadow-[0_1px_0_rgba(212,184,74,0.1)]">
        <div className="mx-auto flex max-w-7xl items-center py-2.5 nyay-page-x">
          <NyayLogoLink />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center py-8 text-center nyay-page-x sm:py-10">
        <p
          className="text-5xl font-bold tabular-nums text-nyay-trust sm:text-6xl dark:text-foreground"
          aria-hidden
        >
          404
        </p>
        <h1 className="mt-3 text-xl font-semibold text-nyay-trust sm:text-2xl dark:text-foreground">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-sm text-nyay-muted sm:text-base">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-nyay-trust px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 ring-1 ring-nyay-authority/30 transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
