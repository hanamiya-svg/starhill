import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import { sectionIds } from "@/lib/navigation";
import { CountUp, Laurel } from "@/components/ui/AedasBits";

export async function EditorialIntro() {
  const t = await getTranslations("intro");
  const tMedia = await getTranslations("media");
  const image = resolveMedia("arch-hero");
  const facts = t.raw("aedas.facts") as { value: string; label: string }[];

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

        {/* Architect */}
        <div className="relative -mx-gutter mt-20 overflow-hidden bg-forest text-ivory md:mx-0 md:mt-28" style={{ ["--shine-a" as string]: "#cbbd8f", ["--shine-b" as string]: "#fbf3d6", ["--shine-c" as string]: "#8f7a48" }}>
          <div aria-hidden className="absolute inset-0">
            <ImageReveal className="h-full w-full" parallax={6}>
              <MediaFrame media={resolveMedia("arch-sculptural")} alt="" pendingLabel={tMedia("pending")} sizes="100vw" className="h-full w-full" />
            </ImageReveal>
          </div>
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(100deg,rgb(24_37_31/0.97)_0%,rgb(24_37_31/0.88)_48%,rgb(24_37_31/0.45)_100%)]" />
          <div className="relative grid gap-12 px-6 py-16 md:grid-cols-12 md:gap-8 md:px-14 md:py-24">
            <Reveal className="md:col-span-7">
              <p className="label-caps flex items-center gap-4 text-champagne">
                <span aria-hidden className="h-px w-12 bg-champagne/60" />
                {t("aedas.label")}
              </p>
              <p className="aedas-shine mt-6 font-luxe text-[clamp(4.5rem,14vw,11.5rem)] leading-[0.85] tracking-[0.04em] uppercase">{t("aedas.name")}</p>
              <p className="mt-8 max-w-lg text-[0.9375rem] leading-[1.85] text-ivory/80">{t("aedas.body")}</p>
              <p className="label-caps mt-8 text-[0.625rem] text-ivory/50">{t("aedas.founder")}</p>
            </Reveal>
            <Reveal className="flex flex-col justify-end gap-8 md:col-span-5" delay={0.2}>
              <div className="border-b border-ivory/15 pb-6">
                <CountUp value={facts[0].value} className="block font-luxe text-[clamp(4rem,8vw,6.5rem)] leading-none text-champagne" />
                <span className="label-caps mt-3 block text-ivory/60">{facts[0].label}</span>
              </div>
              <ul className="grid grid-cols-2 gap-3">
                {facts.slice(1, 3).map((f) => (
                  <li key={f.value} className="flex flex-col items-center gap-2 border border-champagne/30 bg-forest/50 px-3 py-5 text-center backdrop-blur-sm">
                    <Laurel className="size-10 text-champagne" />
                    <span className="font-luxe text-lg leading-tight">{f.value}</span>
                    <span className="label-caps text-[0.5625rem] text-ivory/55">{f.label}</span>
                  </li>
                ))}
              </ul>
              <div>
                <p className="label-caps text-ivory/50">
                  <CountUp value={facts[3].value} className="text-champagne" />
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {facts[3].label.split(/,\s*/).map((r) => (
                    <li key={r} className="border border-ivory/20 px-3 py-1.5 text-xs text-ivory/80">{r}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
