import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionIds } from "./navigation";
import { Photo } from "./Photo";
import { V4Aedas, type AedasProfile } from "./V4Aedas";

/** Танилцуулга: a full-screen opening photograph, then Aedas in one tabbed, full-bleed band. */
export async function V4Intro() {
  const t = await getTranslations("intro");
  const tv = await getTranslations("v4.intro");
  const tm = await getTranslations("media");
  const p = t.raw("aedasProfile") as AedasProfile;

  return (
    <section id={sectionIds.introduction} aria-labelledby="v4-intro-heading" data-nav-theme="dark" className="bg-forest text-ivory">
      <div className="relative h-[100svh] min-h-[36rem] overflow-hidden">
        <Photo k="arch-campus-street" alt={tm("arch-campus-street")} sizes="100vw" parallax={6} priority />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(17_20_18/0.35)_0%,rgb(17_20_18/0)_30%,rgb(17_20_18/0.25)_55%,rgb(17_20_18/0.85)_100%)]" />
        <div className="container-editorial relative flex h-full flex-col justify-end pb-14 md:pb-20">
          <SectionLabel tone="light">{tv("label")}</SectionLabel>
          <h2 id="v4-intro-heading" className="title-script mt-6 max-w-[14ch] text-[clamp(3rem,8.5vw,8rem)] text-balance">
            {t("heading")}
          </h2>
          <Reveal delay={0.3} className="mt-8 grid gap-6 md:grid-cols-12 md:gap-8">
            <p className="max-w-2xl text-[clamp(1rem,1.35vw,1.2rem)] leading-[1.7] text-ivory/85 md:col-span-7">{t("lede")}</p>
            <p className="label-caps self-end text-ivory/60 md:col-span-4 md:col-start-9 md:text-right">{t("aside")}</p>
          </Reveal>
        </div>
      </div>

      <V4Aedas
        profile={p}
        aedas={{ label: t("aedas.label"), name: t("aedas.name"), founder: t("aedas.founder") }}
        tabs={tv.raw("tabs") as Record<"general" | "founder" | "projects" | "awards", string>}
        captions={tv.raw("photoCaptions") as Record<"general" | "founder" | "projects" | "awards", string>}
      />
    </section>
  );
}
