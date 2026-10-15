import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";

/** Key facts from the brochure. Rows without a value are marked pending, never invented. */
export async function ProjectOverview() {
  const t = await getTranslations("overview");

  return (
    <section
      id={sectionIds.overview}
      aria-labelledby="overview-heading"
      data-nav-theme="light"
      className="bg-white py-section"
    >
      <div className="container-editorial grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <SectionLabel index="06">{t("label")}</SectionLabel>
          <SectionHeading id="overview-heading" size="title" className="mt-8">
            {t("heading")}
          </SectionHeading>
          <Reveal delay={0.5}>
            <p className="mt-8 max-w-sm text-[0.9375rem] leading-[1.8] text-ink-muted">{t("intro")}</p>
          </Reveal>
        </div>

        <dl className="md:col-span-7 md:col-start-6">
          {siteConfig.overviewOrder.map((field, i) => {
            const value = t.has(`values.${field}`) ? t(`values.${field}`) : null;
            return (
              <Reveal
                key={field}
                delay={0.1 + i * 0.05}
                y={14}
                className="grid gap-2 border-t border-line py-7 last:border-b sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-8"
              >
                <dt className="label-caps pt-1 text-ink-muted">{t(`fields.${field}`)}</dt>
                <dd>
                  {value ? (
                    <span className="text-[0.9375rem] leading-[1.75] text-ink">{value}</span>
                  ) : (
                    <span className="inline-flex items-center gap-3 text-sm text-ink-muted">
                      <span aria-hidden className="h-px w-6 border-t border-dashed border-line-strong" />
                      {t("pending")}
                    </span>
                  )}
                </dd>
              </Reveal>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
