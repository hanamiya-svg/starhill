import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal } from "@/components/ui/Reveal";
import { resolveMedia } from "@/lib/media";
import { siteConfig } from "@/lib/site-config";

/**
 * Show-apartment photography under the collections: a swipeable row on
 * phones, five staggered frames on desktop. Neutral colours, so each version
 * styles it through `className` and `frameClassName` alone.
 */
export async function InteriorsStrip({
  label,
  note,
  className = "",
  frameClassName = "",
  labelClassName = "label-caps",
}: {
  label: string;
  note: string;
  className?: string;
  /** Extra classes on each photo frame (rounding, borders). */
  frameClassName?: string;
  labelClassName?: string;
}) {
  const tm = await getTranslations("media");

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-6">
        <p className={labelClassName}>{label}</p>
        <p className="text-xs opacity-60">{note}</p>
      </div>
      <ul className="-mx-gutter mt-6 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
        {siteConfig.interiors.map((k, i) => (
          <li key={k} className={`w-[72%] shrink-0 snap-start sm:w-[40%] md:w-auto ${i % 2 ? "md:mt-12" : ""}`}>
            <ImageReveal className={`aspect-[3/4] overflow-hidden ${frameClassName}`} delay={i * 0.06} parallax={0}>
              <MediaFrame
                media={resolveMedia(k)}
                alt={tm(k)}
                pendingLabel={tm("pending")}
                sizes="(min-width: 768px) 20vw, 72vw"
                className="h-full w-full"
                imageClassName="transition-transform duration-[1.4s] ease-[var(--ease-out)] hover:scale-[1.04]"
              />
            </ImageReveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
