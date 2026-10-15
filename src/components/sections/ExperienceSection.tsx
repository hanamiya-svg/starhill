import { Dumbbell, Leaf, MapPin, Mountain, ToyBrick, Wind } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import type { MediaKey } from "@/lib/media-registry";
import { sectionIds } from "@/lib/navigation";

/** The six highlights exactly as the brochure lists them. */
const HIGHLIGHTS = [
  { key: "city", Icon: MapPin },
  { key: "air", Icon: Wind },
  { key: "green", Icon: Leaf },
  { key: "bogd", Icon: Mountain },
  { key: "playground", Icon: ToyBrick },
  { key: "sports", Icon: Dumbbell },
] as const;

const FEATURES: { key: "sports" | "playground" | "restaurant" | "services"; image: MediaKey; aspect: string }[] = [
  { key: "sports", image: "amenity-sports", aspect: "aspect-[4/3]" },
  { key: "playground", image: "amenity-playground", aspect: "aspect-[3/4]" },
  { key: "restaurant", image: "amenity-lounge", aspect: "aspect-[3/4]" },
  { key: "services", image: "arch-night", aspect: "aspect-[4/3]" },
];

/** Amenities — "Хязгааргүй боломж" in the brochure. */
export async function ExperienceSection() {
  const t = await getTranslations("experience");
  const tMedia = await getTranslations("media");

  return (
    <section
      id={sectionIds.experience}
      aria-labelledby="experience-heading"
      data-nav-theme="dark"
      className="bg-forest py-section text-ivory"
    >
      <div className="container-editorial">
        <SectionLabel index="04" tone="light">
          {t("label")}
        </SectionLabel>
        <SectionHeading id="experience-heading" className="mt-8 max-w-[18ch]">
          {t("heading")}
        </SectionHeading>

        <ul className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ivory/15 pt-10 sm:grid-cols-3 md:mt-24 lg:grid-cols-6">
          {HIGHLIGHTS.map(({ key, Icon }, i) => (
            <Reveal as="li" key={key} delay={0.1 + i * 0.07} y={14} className="flex flex-col gap-4">
              <Icon className="size-6 text-champagne" strokeWidth={1} aria-hidden />
              <span className="text-sm leading-snug text-ivory/85">{t(`highlights.${key}`)}</span>
            </Reveal>
          ))}
        </ul>

        <div className="mt-24 grid gap-x-8 gap-y-20 md:mt-32 md:grid-cols-12">
          {FEATURES.map((f, i) => {
            const media = resolveMedia(f.image);
            const wide = f.aspect.includes("4/3");
            const col = i % 2 === 0 ? "md:col-span-7" : "md:col-span-4 md:col-start-9";
            return (
              <figure key={f.key} className={`${col} ${i % 2 === 1 ? "md:mt-32" : ""}`}>
                <ImageReveal className={f.aspect} delay={0.05}>
                  <MediaFrame
                    media={media}
                    alt={tMedia(f.image)}
                    pendingLabel={tMedia("pending")}
                    sizes={wide ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                    className="h-full w-full"
                  />
                </ImageReveal>
                <Reveal delay={0.35} y={16}>
                  <figcaption className="mt-7 max-w-md">
                    <h3 className="font-luxe text-[clamp(1.4rem,2.2vw,2rem)] leading-tight">{t(`features.${f.key}.title`)}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-[1.8] text-ivory/70">{t(`features.${f.key}.body`)}</p>
                  </figcaption>
                </Reveal>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
