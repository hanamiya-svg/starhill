import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { MediaKey } from "@/lib/media-registry";
import { sectionIds } from "./navigation";
import { Photo } from "./Photo";

const CARDS: { key: "fitness" | "night" | "concierge"; image: MediaKey }[] = [
  { key: "fitness", image: "amenity-fitness" },
  { key: "night", image: "arch-night-stars" },
  { key: "concierge", image: "amenity-concierge" },
];

/** Спорт цогцолбор: the building at full height beside its facilities, then three photographs. */
export async function V4Sports() {
  const t = await getTranslations("v4.sports");
  const tm = await getTranslations("media");
  const stats = t.raw("stats") as { value: string; label: string }[];
  const facilities = t.raw("facilities") as string[];

  return (
    <section id={sectionIds.sports} aria-labelledby="v4-sports-heading" data-nav-theme="dark" className="bg-forest text-ivory">
      <div className="grid grid-cols-[minmax(0,1fr)] lg:min-h-[100svh] lg:grid-cols-12">
        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11] lg:col-span-7 lg:aspect-auto">
          <Photo k="amenity-sports-sunset" alt={tm("amenity-sports-sunset")} sizes="(min-width: 1024px) 58vw, 100vw" parallax={4} />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,rgb(17_20_18/0.85),transparent)]" />
          <dl className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-4 md:p-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1">
                <dt className="label-caps text-[0.625rem] text-ivory/65">{s.label}</dt>
                <dd className="font-luxe text-[clamp(1.5rem,2.4vw,2.2rem)] leading-none text-champagne">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col justify-center px-gutter py-14 lg:col-span-5 lg:px-12 lg:py-20 xl:px-16">
          <SectionLabel tone="light">{t("label")}</SectionLabel>
          <h2 id="v4-sports-heading" className="title-script mt-6 text-[clamp(2.4rem,4.2vw,4rem)] text-balance">
            {t("heading")}
          </h2>
          <Reveal delay={0.15}>
            <p className="mt-6 text-[0.9375rem] leading-[1.8] text-ivory/80">{t("lede")}</p>
          </Reveal>
          <p className="label-caps mt-10 text-champagne">{t("facilitiesLabel")}</p>
          <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {facilities.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm leading-snug text-ivory/90">
                <Check className="mt-0.5 size-4 shrink-0 text-champagne" strokeWidth={1.5} aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-10 border-t border-ivory/15 pt-6">
            <p className="label-caps text-ivory/55">{t("servicesLabel")}</p>
            <p className="mt-2 text-sm leading-relaxed text-ivory/75">{t("services")}</p>
          </div>
        </div>
      </div>

      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto p-2 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {CARDS.map(({ key, image }) => (
          <li key={key} className="relative aspect-[4/5] w-[85%] shrink-0 snap-center overflow-hidden sm:w-[60%] md:aspect-[4/3] md:w-auto">
            <Photo k={image} alt={tm(image)} sizes="(min-width: 768px) 33vw, 85vw" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(17_20_18/0.85)_0%,transparent_60%)]" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
              <h3 className="font-luxe text-xl leading-tight md:text-2xl">{t(`${key}.title`)}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ivory/80">{t(`${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
