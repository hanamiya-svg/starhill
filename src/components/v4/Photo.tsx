import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal } from "@/components/ui/Reveal";
import { resolveMedia } from "@/lib/media";
import type { MediaKey } from "@/lib/media-registry";

/** A photograph that fills its (relative, sized) parent edge to edge. */
export function Photo({ k, alt, sizes, parallax = 0, priority }: { k: MediaKey; alt: string; sizes: string; parallax?: number; priority?: boolean }) {
  return (
    <div className="absolute inset-0">
      <ImageReveal className="h-full w-full" parallax={parallax}>
        <MediaFrame media={resolveMedia(k)} alt={alt} pendingLabel="" sizes={sizes} priority={priority} className="h-full w-full" />
      </ImageReveal>
    </div>
  );
}

/** Resolved public URL + crop focus of a registry photo, for client components. */
export function photoProps(k: MediaKey) {
  const m = resolveMedia(k);
  return { src: m.src ?? "", focus: m.focus };
}
