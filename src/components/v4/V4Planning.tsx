import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { MediaKey } from "@/lib/media-registry";
import { sectionIds } from "./navigation";
import { Photo } from "./Photo";

type TileKey = "garden" | "water" | "trail" | "play" | "roof" | "carfree";

const TILES: { key: TileKey; image: MediaKey }[] = [
  { key: "garden", image: "land-plaza" },
  { key: "water", image: "land-family" },
  { key: "trail", image: "land-hills" },
  { key: "play", image: "amenity-playground-aerial" },
  { key: "roof", image: "land-terraces" },
  { key: "carfree", image: "arch-aerial" },
];

/** Төлөвлөлт: the whole site from above with its key figures, then six photographs of what the grounds hold. */
export async function V4Planning() {
  const t = await getTranslations("v4.planning");
  const tm = await getTranslations("media");
  const stats = t.raw("stats") as { value: string; label: string }[];

  return (
    <section id={sectionIds.planning} aria-labelledby="v4-planning-heading" data-nav-theme="dark" className="bg-obsidian text-ivory">
      <div className="relative h-[100svh] min-h-[38rem] overflow-hidden">
        <Photo k="arch-site-aerial" alt={tm("arch-site-aerial")} sizes="100vw" parallax={5} />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(17_20_18/0.55)_0%,rgb(17_20_18/0.1)_35%,rgb(17_20_18/0.2)_60%,rgb(17_20_18/0.9)_100%)]" />
        {/* Phones: the text sits over a busier part of the photo */}
        <div aria-hidden className="absolute inset-0 bg-[rgb(17_20_18/0.35)] md:hidden" />
        <div className="container-editorial relative flex h-full flex-col justify-between pt-[calc(var(--header-h)+2.5rem)] pb-10 md:pb-14">
          <div className="max-w-2xl">
            <SectionLabel tone="light">{t("label")}</SectionLabel>
            <h2 id="v4-planning-heading" className="title-script mt-6 text-[clamp(2.6rem,6vw,5.5rem)] text-balance">
              {t("heading")}
            </h2>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-xl text-[clamp(0.95rem,1.25vw,1.1rem)] leading-[1.75] text-ivory/85">{t("lede")}</p>
            </Reveal>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-ivory/25 pt-6 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1.5">
                <dt className="label-caps text-[0.625rem] text-ivory/60">{s.label}</dt>
                <dd className="font-luxe text-[clamp(1.6rem,2.6vw,2.4rem)] leading-none text-champagne">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Six photographs: a swipeable row on phones, a 3 × 2 wall on larger screens. */}
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto p-2 [scrollbar-width:none] md:grid md:h-[min(92svh,60rem)] md:grid-cols-3 md:grid-rows-2 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {TILES.map(({ key, image }) => (
          <li key={key} className="relative h-[68svh] w-[85%] shrink-0 snap-center overflow-hidden sm:w-[60%] md:h-auto md:w-auto">
            <Photo k={image} alt={tm(image)} sizes="(min-width: 768px) 33vw, 85vw" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(17_20_18/0.85)_0%,rgb(17_20_18/0.2)_45%,transparent_70%)]" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
              <h3 className="font-luxe text-[clamp(1.3rem,1.8vw,1.75rem)] leading-tight">{t(`tiles.${key}.title`)}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ivory/80">{t(`tiles.${key}.body`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
