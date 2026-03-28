"use client";

import { useEffect } from "react";
import Link from "next/link";
import { NyayLogoLink } from "@/components/nyay-logo-link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col bg-nyay-canvas">
      <header className="sticky top-0 z-40 border-b border-nyay-border/90 bg-nyay-surface/90 shadow-[0_1px_0_rgba(201,162,39,0.12)] backdrop-blur-md dark:bg-[color-mix(in_srgb,var(--nyay-surface)_92%,transparent)] dark:shadow-[0_1px_0_rgba(212,184,74,0.1)]">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <NyayLogoLink />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
        <h1 className="text-xl font-semibold text-nyay-trust sm:text-2xl dark:text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-sm text-nyay-muted sm:text-base">
          We could not load this page. You can try again or return to the
          dashboard.
        </p>
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-lg bg-nyay-trust px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-nyay-trust/20 ring-1 ring-nyay-authority/30 transition hover:bg-nyay-trust-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority dark:bg-nyay-trust-mid dark:hover:bg-nyay-trust-soft"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-nyay-border bg-nyay-surface px-5 py-2.5 text-sm font-semibold text-nyay-trust transition hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority dark:border-white/15 dark:bg-transparent dark:text-foreground dark:hover:bg-white/5"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
