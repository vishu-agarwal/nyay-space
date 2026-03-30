import Image from "next/image";
import Link from "next/link";
import { NYAY_LOGO_SRC } from "@/lib/nyay-logo";

type NyayLogoLinkProps = {
  href?: string;
  className?: string;
};

export function NyayLogoLink({
  href = "/",
  className = "",
}: NyayLogoLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex shrink-0 cursor-pointer items-center rounded-md transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nyay-authority ${className}`}
    >
     <Image
  src={NYAY_LOGO_SRC}
  alt="Nyay Space"
  width={200}
  height={200}
  className="w-auto h-auto max-h-24 sm:max-h-28 md:max-h-30 object-contain"
  priority
/>
    </Link>
  );
}
