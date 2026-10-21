import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import type { MediaKey } from "@/lib/media-registry";
import { sectionIds } from "@/lib/navigation";

const HIGHLIGHTS: { key: "sculptural" | "glass" | "light"; image: MediaKey }[] = [
  { key: "sculptural", image: "land-terraces" },
  { key: "glass", image: "arch-street-tower" },
  { key: "light", image: "arch-tower-day" },
];

/** One wide image, then three highlights (a swipeable row on phones). */
export async function ArchitectureShowcase() {
  const t = await getTranslations("architecture");
  const tMedia = await getTranslations("media");
  const pending = tMedia("pending");
  const hero = resolveMedia("arch-night-stars");

  return (
    <section
      id={sectionIds.architecture}
      aria-labelledby="architecture-heading"
      data-nav-theme="light"
      className="bg-white py-section"
    >
      <div className="container-editorial">
        <div className="grid gap-8 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <SectionLabel index="02">{t("label")}</SectionLabel>
            <SectionHeading id="architecture-heading" className="mt-8 max-w-[16ch]">
              {t("heading")}
            </SectionHeading>
          </div>
          <Reveal className="self-end md:col-span-4 md:col-start-9" delay={0.4}>
            <p className="text-[0.9375rem] leading-[1.8] text-ink-muted">{t("lede")}</p>
          </Reveal>
        </div>

        <figure className="relative mt-12 md:mt-20">
          <ImageReveal className="aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[21/9]" parallax={4}>
            <MediaFrame media={hero} alt={tMedia(hero.key)} pendingLabel={pending} sizes="100vw" className="h-full w-full" />
          </ImageReveal>
          <figcaption className="absolute bottom-4 left-4 bg-white/90 px-4 py-3 backdrop-blur md:bottom-8 md:left-8 md:px-6 md:py-4">
            <span className="label-caps block text-[0.625rem] text-gold-deep">{t("credit.label")}</span>
            <span className="mt-1 block font-luxe text-lg leading-tight text-ink md:text-xl">{t("credit.value")}</span>
          </figcaption>
        </figure>

        <ul className="-mx-gutter mt-10 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] md:mx-0 md:mt-16 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {HIGHLIGHTS.map(({ key, image }, i) => {
            const media = resolveMedia(image);
            return (
              <li key={key} className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto">
                <ImageReveal className="group aspect-[4/3]" delay={i * 0.08} parallax={0}>
                  <MediaFrame
                    media={media}
                    alt={tMedia(image)}
                    pendingLabel={pending}
                    sizes="(min-width: 768px) 30vw, 78vw"
                    className="h-full w-full"
                    imageClassName="transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                  />
                </ImageReveal>
                <Reveal delay={0.2 + i * 0.08} y={12}>
                  <div className="mt-5 flex items-baseline gap-3 border-t border-line pt-4">
                    <span className="label-caps text-gold-deep tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-luxe text-lg leading-snug text-ink md:text-xl">{t(`items.${key}.title`)}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t(`items.${key}.caption`)}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
