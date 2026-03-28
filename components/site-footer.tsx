export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-nyay-border/90 bg-nyay-surface/85 backdrop-blur-sm dark:bg-[color-mix(in_srgb,var(--nyay-surface)_88%,transparent)]">
      <div className="mx-auto max-w-7xl py-3 nyay-page-x sm:py-4">
        <p className="text-center text-xs leading-relaxed text-nyay-muted sm:text-sm">
          © {year} Advocate Anshika Agarwal. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
