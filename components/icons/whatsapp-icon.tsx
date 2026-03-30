import type { ComponentPropsWithoutRef } from "react";

const WHATSAPP_MASK: NonNullable<ComponentPropsWithoutRef<"span">["style"]> = {
  maskImage: "url(/icons/whatsapp.svg)",
  maskSize: "contain",
  maskPosition: "center",
  maskRepeat: "no-repeat",
  WebkitMaskImage: "url(/icons/whatsapp.svg)",
  WebkitMaskSize: "contain",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
};

type Props = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  className?: string;
};

/** Renders `public/icons/whatsapp.svg` with `currentColor` via CSS mask. */
export function WhatsAppIcon({
  className = "h-4 w-4 shrink-0",
  style,
  ...rest
}: Props) {
  return (
    <span
      className={`inline-block bg-current ${className}`}
      style={{ ...WHATSAPP_MASK, ...style }}
      aria-hidden
      {...rest}
    />
  );
}
