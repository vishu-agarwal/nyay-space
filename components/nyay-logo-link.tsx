import Image from "next/image";
import Link from "next/link";
import { NYAY_LOGO_SRC } from "@/lib/nyay-logo";

type NyayLogoLinkProps = {
  href?: string;
  className?: string;
};

export function NyayLogoLink({
  href = "/dashboard",
  className = "",
}: NyayLogoLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 items-center rounded-md transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority ${className}`}
    >
      <Image
        src={NYAY_LOGO_SRC}
        alt="Nyay Space"
        width={360}
        height={90}
        className="h-12 w-auto max-h-12 object-contain object-left sm:h-14 sm:max-h-14 md:h-16 md:max-h-16"
        priority
      />
    </Link>
  );
}
