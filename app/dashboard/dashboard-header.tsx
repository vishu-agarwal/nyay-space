"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", match: "exact" as const },
  { href: "/dashboard/calendar", label: "Calendar", match: "prefix" as const },
  { href: "/dashboard/cases", label: "Cases", match: "prefix" as const },
  { href: "/dashboard/clients", label: "Clients", match: "prefix" as const },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-nyay-border/90 bg-nyay-surface/90 shadow-[0_1px_0_rgba(201,162,39,0.12)] backdrop-blur-md dark:bg-[color-mix(in_srgb,var(--nyay-surface)_92%,transparent)] dark:shadow-[0_1px_0_rgba(212,184,74,0.1)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-sm font-semibold tracking-wide text-nyay-trust transition-colors dark:text-foreground"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-nyay-trust text-xs font-bold text-white shadow-md shadow-nyay-trust/25 ring-1 ring-nyay-authority/35 transition-transform group-hover:scale-[1.02] dark:bg-nyay-trust-mid dark:ring-nyay-authority/40"
            aria-hidden
          >
            N
          </span>
          <span className="uppercase tracking-[0.12em]">
            Nyay{" "}
            <span className="text-nyay-authority transition-colors group-hover:text-nyay-authority-rich dark:text-nyay-authority">
              Space
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap gap-1" aria-label="Dashboard">
          {nav.map(({ href, label, match }) => {
            const active = isActive(pathname, href, match);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-nyay-authority-soft text-nyay-trust shadow-sm ring-1 ring-nyay-authority/35 dark:bg-nyay-authority/15 dark:text-nyay-authority dark:ring-nyay-authority/30"
                    : "text-nyay-trust-mid hover:bg-nyay-canvas hover:text-nyay-trust dark:text-foreground/85 dark:hover:bg-white/5 dark:hover:text-foreground",
                ].join(" ")}
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
