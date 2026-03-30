import type { ComponentPropsWithoutRef, CSSProperties } from "react";

function maskStyle(name: string): CSSProperties {
  const url = `url(/icons/${name}.svg)`;
  return {
    maskImage: url,
    maskSize: "contain",
    maskPosition: "center",
    maskRepeat: "no-repeat",
    WebkitMaskImage: url,
    WebkitMaskSize: "contain",
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
  };
}

type Props = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  /** Base name under `public/icons/` (no `.svg`). */
  name: string;
};

/** Renders a monochrome icon from `public/icons/{name}.svg` using `currentColor` via CSS mask. */
export function MaskIcon({
  name,
  className = "h-4 w-4 shrink-0",
  style,
  ...rest
}: Props) {
  return (
    <span
      className={`inline-block bg-current ${className}`}
      style={{ ...maskStyle(name), ...style }}
      aria-hidden
      {...rest}
    />
  );
}
