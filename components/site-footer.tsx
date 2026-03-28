export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-nyay-border/90 bg-nyay-surface/85 backdrop-blur-sm dark:bg-[color-mix(in_srgb,var(--nyay-surface)_88%,transparent)]">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <p className="text-center text-xs leading-relaxed text-nyay-muted sm:text-sm">
          © {year} Advocate Anshika Agarwal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
