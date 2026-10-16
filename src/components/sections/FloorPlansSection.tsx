import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { floors, unitLayouts } from "@/lib/floor-plans";
import { sectionIds } from "@/lib/navigation";
import { FloorPlanExplorer } from "./FloorPlanExplorer";

/** Floor-by-floor drawings and furnished 3D layouts, from the architect's plan set. */
export async function FloorPlansSection() {
  const t = await getTranslations("plans");

  return (
    <section
      id={sectionIds.plans}
      aria-labelledby="plans-heading"
      data-nav-theme="dark"
      className="bg-obsidian py-section text-ivory"
    >
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <SectionLabel index="06" tone="light">
              {t("label")}
            </SectionLabel>
            <SectionHeading id="plans-heading" className="mt-8">
              {t("heading")}
            </SectionHeading>
          </div>
          <Reveal className="self-end md:col-span-4 md:col-start-9" delay={0.4}>
            <p className="text-[0.9375rem] leading-[1.8] text-ivory/60">{t("intro")}</p>
          </Reveal>
        </div>

        <FloorPlanExplorer floors={floors} layouts={unitLayouts} />

        <Reveal delay={0.2} className="mt-16 md:mt-20">
          <p className="text-xs leading-relaxed text-ivory/40">{t("source")}</p>
        </Reveal>
      </div>
    </section>
  );
}
