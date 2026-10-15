import { ArrowUpRight, MapPin } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";

export async function LocationSection() {
  const t = await getTranslations("location");
  const tMedia = await getTranslations("media");
  const locale = (await getLocale()) as "mn" | "en";
  const { address, mapEmbedUrl, mapLink, landmarks } = siteConfig.location;
  const addressText = address?.[locale];
  const map = resolveMedia("location-map");

  return (
    <section
      id={sectionIds.location}
      aria-labelledby="location-heading"
      data-nav-theme="light"
      className="bg-white py-section"
    >
      <div className="container-editorial grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="flex flex-col md:col-span-5">
          <SectionLabel index="08">{t("label")}</SectionLabel>
          <SectionHeading id="location-heading" className="mt-8">
            {t("heading")}
          </SectionHeading>
          <Reveal delay={0.45}>
            <p className="mt-8 max-w-sm text-[0.9375rem] leading-[1.8] text-ink-muted">{t("body")}</p>
          </Reveal>

          <Reveal delay={0.55} className="mt-12 grid gap-10 border-t border-line pt-6 sm:grid-cols-2 md:mt-auto">
            <div>
              <p className="label-caps text-ink-muted">{t("addressLabel")}</p>
              <address className="mt-3 text-base leading-relaxed not-italic">
                {addressText ?? <span className="text-ink-muted">{t("addressPending")}</span>}
              </address>
              {mapLink ? (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-caps link-draw mt-6 inline-flex items-center gap-2 pb-1"
                >
                  {t("openMap")}
                  <ArrowUpRight className="size-3.5" strokeWidth={1.25} />
                </a>
              ) : null}
            </div>
            {landmarks.length ? (
              <div>
                <p className="label-caps text-ink-muted">{t("landmarksLabel")}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-ink">
                  {landmarks.map((l) => (
                    <li key={l.en}>{l[locale]}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          {mapEmbedUrl ? (
            <Reveal>
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-ivory sm:aspect-[4/5]">
                <iframe
                  src={mapEmbedUrl}
                  title={t("mapTitle")}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0 grayscale-[0.6]"
                />
              </div>
            </Reveal>
          ) : map.src ? (
            <ImageReveal className="aspect-[7/10] w-full bg-ivory" parallax={3}>
              <MediaFrame
                media={map}
                alt={t("mapTitle")}
                pendingLabel={tMedia("pending")}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-full w-full"
                imageClassName="object-contain"
              />
            </ImageReveal>
          ) : (
            <Reveal>
              <div className="relative flex aspect-[4/5] w-full items-center justify-center bg-ivory sm:aspect-[16/11]">
                <div className="flex max-w-xs flex-col items-center gap-6 px-6 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full border border-line-strong">
                    <MapPin className="size-5 text-ink-muted" strokeWidth={1.25} />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-muted">{t("mapPending")}</p>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
