import Image from "next/image";

/**
 * Official STAR HILL Residence lockups (trimmed from the supplied artboards;
 * originals live in source-media/logo/).
 */
const LOGOS = {
  horizontal: { src: "/logo/star-hill-logo-horizontal.png", width: 2591, height: 1330 },
  stacked: { src: "/logo/star-hill-logo-stacked.png", width: 1729, height: 1311 },
  monogram: { src: "/logo/star-hill-monogram.png", width: 716, height: 1232 },
  emblem: { src: "/logo/star-hill-emblem-alt.png", width: 2277, height: 1350 },
} as const;

export type LogoVariant = keyof typeof LOGOS;

export function Logo({
  variant,
  className,
  priority,
  sizes,
  alt = "STAR HILL Residence",
}: {
  variant: LogoVariant;
  /** Size it with a width or height class; the other side follows the aspect ratio. */
  className?: string;
  priority?: boolean;
  sizes: string;
  alt?: string;
}) {
  const logo = LOGOS[variant];
  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt={alt}
      sizes={sizes}
      priority={priority}
      draggable={false}
      className={`select-none ${className ?? ""}`}
    />
  );
}
