import Image from "next/image";
import { NYAY_LOGO_SRC } from "@/lib/nyay-logo";

export default function Loading() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 py-16 nyay-page-x"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="relative flex flex-col items-center gap-1">
        <span
          className="nyay-loader-halo pointer-events-none absolute -inset-x-6 -inset-y-4 rounded-3xl bg-nyay-authority/10 dark:bg-nyay-authority/15"
          aria-hidden
        />
        <Image
          src={NYAY_LOGO_SRC}
          alt=""
          width={280}
          height={70}
          className="nyay-logo-loader relative z-10 h-12 w-auto max-w-[min(100%,280px)] object-contain object-center sm:h-14"
          priority
          aria-hidden
        />
      </div>
      <p className="text-sm font-medium text-nyay-muted">Loading…</p>
    </div>
  );
}
