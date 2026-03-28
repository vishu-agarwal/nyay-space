"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { GlobalSearch } from "@/components/practice/global-search";
import { NyayLogoLink } from "@/components/nyay-logo-link";
import { routes } from "@/lib/routes";

const nav = [
  { href: routes.home, label: "Home", match: "exact" as const },
  { href: routes.calendar, label: "Calendar", match: "prefix" as const },
  { href: routes.cases, label: "Cases", match: "prefix" as const },
  { href: routes.clients, label: "Clients", match: "prefix" as const },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean) {
  return [
    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 md:inline-block md:py-2",
    active
      ? "bg-nyay-authority-soft text-nyay-trust shadow-sm ring-1 ring-nyay-authority/35 dark:bg-nyay-authority/15 dark:text-nyay-authority dark:ring-nyay-authority/30"
      : "text-nyay-trust-mid hover:bg-nyay-canvas hover:text-nyay-trust dark:text-foreground/85 dark:hover:bg-white/5 dark:hover:text-foreground",
  ].join(" ");
}

export function PracticeHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-nyay-border/90 bg-nyay-surface/90 shadow-[0_1px_0_rgba(201,162,39,0.12)] backdrop-blur-md dark:bg-[color-mix(in_srgb,var(--nyay-surface)_92%,transparent)] dark:shadow-[0_1px_0_rgba(212,184,74,0.1)]">
      <div className="mx-auto flex h-18 max-w-6xl min-w-0 items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <NyayLogoLink className="shrink-0" />

        <div className="flex min-w-0 flex-1 justify-end md:justify-start">
          <GlobalSearch />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-nyay-border text-nyay-trust transition hover:bg-nyay-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority md:hidden dark:border-white/15 dark:text-foreground dark:hover:bg-white/5"
            aria-expanded={menuOpen}
            aria-controls="practice-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <span className="sr-only">Close</span>
            ) : (
              <span className="sr-only">Menu</span>
            )}
            <span
              className="relative flex h-5 w-5 flex-col justify-center gap-[5px]"
              aria-hidden
            >
              <span
                className={[
                  "block h-0.5 w-full rounded-full bg-current transition duration-200 ease-out",
                  menuOpen ? "translate-y-[7px] rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-full rounded-full bg-current transition duration-200 ease-out",
                  menuOpen ? "scale-x-0 opacity-0" : "opacity-100",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-0.5 w-full rounded-full bg-current transition duration-200 ease-out",
                  menuOpen ? "-translate-y-[7px] -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>

          <nav className="hidden flex-wrap gap-1 md:flex" aria-label="Practice">
            {nav.map(({ href, label, match }) => {
              const active = isActive(pathname, href, match);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={navLinkClass(active)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div
        id="practice-mobile-nav"
        className={[
          "border-t border-nyay-border/80 bg-nyay-surface/95 backdrop-blur-md md:hidden dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--nyay-surface)_95%,transparent)]",
          menuOpen ? "block" : "hidden",
        ].join(" ")}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6 lg:px-8"
          aria-label="Practice mobile"
        >
          {nav.map(({ href, label, match }) => {
            const active = isActive(pathname, href, match);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={navLinkClass(active)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
