"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";

const SEGMENT_LABELS: Record<string, string> = {
  tasks: "Tasks / To-Do",
  calendar: "Calendar",
  cases: "Cases",
  clients: "Clients",
  documents: "Documents",
};

function segmentLabel(segment: string, parent?: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  if (parent === "cases" || parent === "clients") return decodeURIComponent(segment);
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PracticeBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-nyay-muted" aria-label="Breadcrumb">
      <Link
        href={routes.home}
        className="font-semibold text-nyay-authority transition-colors hover:text-nyay-authority-rich"
      >
        Nyay Space
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const parent = index > 0 ? segments[index - 1] : undefined;
        const label = segmentLabel(segment, parent);

        return (
          <span key={href}>
            <span className="text-nyay-muted/70"> / </span>
            {isLast ? (
              <span className="font-medium text-nyay-trust dark:text-foreground">{label}</span>
            ) : (
              <Link
                href={href}
                className="font-medium text-nyay-trust-mid transition-colors hover:text-nyay-trust dark:text-foreground/90"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
