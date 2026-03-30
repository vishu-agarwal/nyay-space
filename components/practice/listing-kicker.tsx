import Link from "next/link";
import { routes } from "@/lib/routes";

/** “Nyay Space / Section” line above list and calendar page titles. */
export function PracticeListingKicker({ section }: { section: string }) {
  return (
    <p className="text-sm font-semibold tracking-wide text-nyay-authority uppercase">
      <Link
        href={routes.home}
        className="transition-colors hover:text-nyay-authority-rich"
      >
        Nyay Space
      </Link>
      <span className="text-nyay-muted/70"> / </span>
      {section}
    </p>
  );
}
