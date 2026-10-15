import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import { sectionIds } from "@/lib/navigation";

export async function EditorialIntro() {
  const t = await getTranslations("intro");
  const tMedia = await getTranslations("media");
  const image = resolveMedia("arch-hero");

  return (
    <section
      id={sectionIds.introduction}
      aria-labelledby="introduction-heading"
      data-nav-theme="light"
      className="bg-ivory py-section"
    >
      <div className="container-editorial">
        <SectionLabel index="01">{t("label")}</SectionLabel>
        <SectionHeading id="introduction-heading" size="display" className="mt-8 max-w-[15ch] md:mt-10">
          {t("heading")}
        </SectionHeading>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-8">
          <ImageReveal className="aspect-[4/5] md:col-span-6 md:aspect-[5/6] lg:col-span-7 lg:aspect-[16/12]">
            <MediaFrame
              media={image}
              alt={tMedia(image.key)}
              pendingLabel={tMedia("pending")}
              sizes="(min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw"
              className="h-full w-full"
            />
          </ImageReveal>

          <div className="flex flex-col justify-end md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
            <Reveal delay={0.5}>
              <p className="font-luxe text-[clamp(1.3rem,1.8vw,1.7rem)] leading-[1.5] text-ink">{t("lede")}</p>
            </Reveal>
            <Reveal delay={0.7}>
              <p className="mt-10 max-w-prose border-l border-champagne pl-6 font-luxe text-lg leading-[1.6] text-ink/80 italic">{t("body")}</p>
            </Reveal>
            <Reveal delay={0.9}>
              <p className="label-caps mt-12 border-t border-line pt-6 text-ink-muted">{t("aside")}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
