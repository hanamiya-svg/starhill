import { getLocale, getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";
import { InteriorsStrip } from "./InteriorsStrip";
import { ResidenceFlipCard } from "./ResidenceFlipCard";

/** Crystal · Diamond · Duplex · Penthouse, interiors and the payment terms — all from the brochure. */
export async function ResidencesSection() {
  const t = await getTranslations("residences");
  const tMedia = await getTranslations("media");
  const locale = (await getLocale()) as "mn" | "en";
  const { residences, residenceSummary, banks } = siteConfig;
  const terms = t.raw("financing.terms") as string[];

  return (
    <section
      id={sectionIds.residences}
      aria-labelledby="residences-heading"
      data-nav-theme="light"
      className="bg-ivory py-section"
    >
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <SectionLabel index="05">{t("label")}</SectionLabel>
            <SectionHeading id="residences-heading" className="mt-8">
              {t("heading")}
            </SectionHeading>
          </div>
          <Reveal className="self-end md:col-span-4 md:col-start-9" delay={0.4}>
            <p className="text-[0.9375rem] leading-[1.8] text-ink-muted">
              {t("intro", { rooms: residenceSummary.rooms, area: residenceSummary.area })}
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-x-8 gap-y-16 md:mt-24 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
          {residences.map((r, i) => {
            const media = resolveMedia(r.image);
            return (
              <li key={r.id} className={i % 2 === 1 ? "sm:mt-16" : ""}>
                <Reveal y={24} delay={i * 0.08}>
                  <ResidenceFlipCard
                    front={
                      <ImageReveal className="h-full w-full" parallax={0}>
                        <MediaFrame
                          media={media}
                          alt={tMedia(r.image)}
                          pendingLabel={tMedia("pending")}
                          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 45vw, 100vw"
                          className="h-full w-full"
                        />
                      </ImageReveal>
                    }
                    plan={{ ...r.plan, alt: t("planAlt", { name: r.name }) }}
                    labels={{ showPlan: t("showPlan"), showPhoto: t("showPhoto"), planTag: t("example", { area: r.example }) }}
                  />
                </Reveal>
                <Reveal delay={0.3} y={16}>
                  <div className="mt-7 border-t border-ink pt-5">
                    <p className="label-caps text-gold-deep">{t(`collections.${r.id}.subtitle`)}</p>
                    <h3 className="title-script mt-3 text-[clamp(2.4rem,3vw,3.2rem)] text-ink">{r.name}</h3>
                    <dl className="mt-4 space-y-1 font-luxe text-lg text-ink">
                      {r.sizes.map((sz) => (
                        <div key={sz.rooms} className="flex items-baseline justify-between gap-4 border-b border-line pb-1">
                          <dt>{t("rooms", { count: sz.rooms })}</dt>
                          <dd className="tabular-nums">{sz.area}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-5 text-[0.9375rem] leading-[1.8] text-ink-muted">{t(`collections.${r.id}.body`)}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>

        <InteriorsStrip label={t("interiors")} note={t("interiorsNote")} className="mt-24 md:mt-32" />

        {/* Payment terms */}
        <div className="mt-28 grid gap-12 border-t border-line pt-12 md:mt-36 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <SectionLabel>{t("financing.label")}</SectionLabel>
            <SectionHeading size="title" className="mt-8">
              {t("financing.heading")}
            </SectionHeading>
            <p className="mt-6 text-[0.9375rem] leading-[1.8] text-ink-muted">{t("financing.intro")}</p>
            <Reveal delay={0.5}>
              <p className="label-caps mt-10 text-ink-muted">{t("financing.partners")}</p>
              <ul className="mt-4 space-y-1 text-sm text-ink">
                {banks.map((b) => (
                  <li key={b.en}>{b[locale]}</li>
                ))}
              </ul>
            </Reveal>
          </div>
          <ol className="md:col-span-7 md:col-start-6">
            {terms.map((term, i) => (
              <Reveal as="li" key={i} delay={0.15 + i * 0.1} className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-line py-7 first:border-t-0 first:pt-0">
                <span className="label-caps pt-1.5 text-gold-deep tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-[0.9375rem] leading-[1.8] text-ink">{term}</p>
              </Reveal>
            ))}
            <Reveal delay={0.5} className="mt-6">
              <p className="text-xs leading-relaxed text-ink-muted">{t("financing.note")}</p>
            </Reveal>
          </ol>
        </div>
      </div>
    </section>
  );
}
