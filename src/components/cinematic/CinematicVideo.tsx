"use client";

import type { Ref } from "react";
import type { ResolvedMedia } from "@/lib/media-registry";
import { MediaFrame } from "@/components/ui/MediaFrame";

export type CinematicStill = { media: ResolvedMedia; alt: string };

type CinematicVideoProps = {
  videoRef: Ref<HTMLVideoElement>;
  stills: CinematicStill[];
  poster: string | null;
  hasVideo: boolean;
  pendingLabel: string;
  mobileObjectPosition: string;
};

/**
 * Media layers for the intro, bottom to top:
 *   1. Scene stills — the image-sequence fallback (also used when reduced motion is on).
 *   2. Poster frame — only when a real video exists, shown until the first frame decodes.
 *   3. The scrubbable <video>, faded in once it can actually paint frames.
 *
 * The `src` is attached from CinematicStage after mount, so nothing heavy loads
 * during SSR/hydration or for visitors who prefer reduced motion.
 */
export function CinematicVideo({
  videoRef,
  stills,
  poster,
  hasVideo,
  pendingLabel,
  mobileObjectPosition,
}: CinematicVideoProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-forest"
      style={{ ["--cine-mobile-pos" as string]: mobileObjectPosition }}
    >
      {stills.map((still, i) => (
        <div
          key={still.media.key + i}
          data-still={i}
          className="absolute inset-0"
          style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
        >
          <div data-camera className="absolute inset-0 will-change-transform">
            <MediaFrame
              media={still.media}
              alt={still.alt}
              pendingLabel={pendingLabel}
              sizes="100vw"
              priority={i === 0}
              className="h-full w-full"
              labelClassName="top-[calc(var(--header-h)+0.5rem)] left-3"
            />
          </div>
        </div>
      ))}

      {hasVideo && poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative poster frame, swapped for video on ready
        <img
          data-poster
          src={poster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover [object-position:var(--cine-mobile-pos)] transition-opacity duration-700 md:[object-position:50%_50%]"
          fetchPriority="high"
        />
      ) : null}

      {hasVideo ? (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 [object-position:var(--cine-mobile-pos)] md:[object-position:50%_50%]"
        />
      ) : null}
    </div>
  );
}
