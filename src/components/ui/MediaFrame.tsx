import Image from "next/image";
import type { ResolvedMedia } from "@/lib/media-registry";
import { ArchitecturalPlaceholder } from "./ArchitecturalPlaceholder";

type MediaFrameProps = {
  media: ResolvedMedia;
  alt: string;
  /** Shown on the placeholder when the real image is missing. */
  pendingLabel: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** Where the "image pending" label sits on placeholders. */
  labelClassName?: string;
};

/**
 * Renders a supplied architectural image (cropped with object-cover inside a
 * sized parent) or a clearly-labelled placeholder when the file is missing.
 * The parent controls the aspect ratio.
 */
export function MediaFrame({
  media,
  alt,
  pendingLabel,
  sizes,
  priority,
  className,
  imageClassName,
  labelClassName,
}: MediaFrameProps) {
  if (media.src) {
    return (
      <div className={`relative overflow-hidden bg-stone/30 ${className ?? ""}`}>
        <Image
          src={media.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${imageClassName ?? ""}`}
          style={{ objectPosition: media.focus }}
        />
      </div>
    );
  }

  const label =
    process.env.NODE_ENV === "production"
      ? pendingLabel
      : `${pendingLabel} · ${media.expected}`;

  return (
    <ArchitecturalPlaceholder
      art={media.art}
      title={alt}
      label={label}
      labelClassName={labelClassName}
      className={`${className ?? ""} ${imageClassName ?? ""}`}
    />
  );
}
