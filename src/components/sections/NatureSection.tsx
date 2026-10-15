import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import { sectionIds } from "@/lib/navigation";

export async function NatureSection() {
  const t = await getTranslations("nature");
  const tMedia = await getTranslations("media");
  const pending = tMedia("pending");
  const hills = resolveMedia("land-hills");
  const grounds = resolveMedia("land-grounds");
  const street = resolveMedia("land-street");

  return (
    <section
      id={sectionIds.nature}
      aria-labelledby="nature-heading"
      data-nav-theme="light"
      className="bg-ivory py-section"
    >
      <div className="container-editorial grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          <SectionLabel index="03">{t("label")}</SectionLabel>
          <SectionHeading id="nature-heading" className="mt-8 max-w-[18ch]">
            {t("heading")}
          </SectionHeading>
        </div>
        <Reveal className="self-end md:col-span-4 md:col-start-9" delay={0.5}>
          <p className="text-[0.9375rem] leading-[1.8] text-ink-muted">{t("body")}</p>
        </Reveal>
      </div>

      <figure className="mt-20 md:mt-28">
        <ImageReveal className="aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[21/9]" parallax={7}>
          <MediaFrame media={hills} alt={tMedia(hills.key)} pendingLabel={pending} sizes="100vw" className="h-full w-full" />
        </ImageReveal>
        <Reveal delay={0.8} y={16}>
          <figcaption className="container-editorial label-caps mt-5 text-ink-muted">{t("captions.hills")}</figcaption>
        </Reveal>
      </figure>

      <div className="container-editorial mt-20 grid gap-16 md:mt-32 md:grid-cols-12 md:gap-8">
        <figure className="md:col-span-7">
          <ImageReveal className="aspect-[4/3]">
            <MediaFrame
              media={grounds}
              alt={tMedia(grounds.key)}
              pendingLabel={pending}
              sizes="(min-width: 768px) 58vw, 100vw"
              className="h-full w-full"
            />
          </ImageReveal>
          <figcaption className="label-caps mt-5 text-ink-muted">{t("captions.grounds")}</figcaption>
        </figure>
        <figure className="w-3/4 justify-self-end md:col-span-4 md:col-start-9 md:mt-40 md:w-full">
          <ImageReveal className="aspect-[3/4]" from="right" delay={0.2}>
            <MediaFrame
              media={street}
              alt={tMedia(street.key)}
              pendingLabel={pending}
              sizes="(min-width: 768px) 33vw, 75vw"
              className="h-full w-full"
            />
          </ImageReveal>
          <figcaption className="label-caps mt-5 text-ink-muted">{t("captions.street")}</figcaption>
        </figure>
      </div>
    </section>
  );
}
