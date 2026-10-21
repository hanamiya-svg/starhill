import { ArrowUpRight, Dumbbell, Leaf, Mail, MapPin, Mountain, Phone, Plus, ToyBrick, Wind } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { BrochureForm } from "@/components/sections/BrochureForm";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { resolveMedia } from "@/lib/media";
import type { MediaKey } from "@/lib/media-registry";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";
import { V3Head, V3Pill } from "./ui";
import { CountUp, Laurel } from "@/components/ui/AedasBits";

type Locale = "mn" | "en";

function Img({ k, alt, sizes, className, pending, parallax = 0 }: { k: MediaKey; alt: string; sizes: string; className: string; pending: string; parallax?: number }) {
  return (
    <ImageReveal className={`overflow-hidden rounded-[1.75rem] ${className}`} parallax={parallax}>
      <MediaFrame media={resolveMedia(k)} alt={alt} pendingLabel={pending} sizes={sizes} className="h-full w-full" />
    </ImageReveal>
  );
}

/* Setting (nature) ───────────────────────────────────────────────────────── */
export async function V3Setting() {
  const t = await getTranslations("nature");
  const tm = await getTranslations("media");
  const cards: { k: MediaKey; caption: string; cls: string }[] = [
    { k: "land-hills", caption: t("captions.hills"), cls: "md:col-span-2 md:row-span-2 aspect-[4/5] md:aspect-auto" },
    { k: "land-grounds", caption: t("captions.grounds"), cls: "aspect-[4/5] md:aspect-[4/3]" },
    { k: "land-street", caption: t("captions.street"), cls: "aspect-[4/5] md:aspect-[4/3]" },
  ];
  return (
    <section id={sectionIds.nature} aria-labelledby="v3-nature" className="bg-paper py-section">
      <div className="container-editorial">
        <V3Head label={t("label")} title={t("heading")} id="v3-nature" intro={t("body")} align="center" />
        <ul className="-mx-gutter mt-14 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto px-gutter [scrollbar-width:none] md:mx-0 md:mt-20 md:grid md:grid-cols-3 md:grid-rows-2 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {cards.map((c) => (
            <li key={c.k} className={`relative w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto ${c.cls}`}>
              <div className="absolute inset-0">
                <Img k={c.k} alt={tm(c.k)} pending={tm("pending")} sizes="(min-width: 768px) 50vw, 80vw" className="h-full w-full" />
              </div>
              <span className="absolute bottom-4 left-4 rounded-full bg-card/90 px-4 py-2 text-xs text-fg backdrop-blur">{c.caption}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Introduction ───────────────────────────────────────────────────────────── */
export async function V3Intro() {
  const t = await getTranslations("intro");
  const tm = await getTranslations("media");
  const facts = t.raw("aedas.facts") as { value: string; label: string }[];
  return (
    <section id={sectionIds.introduction} aria-labelledby="v3-intro" className="bg-paper pb-section">
      <div className="container-editorial grid items-center gap-10 md:grid-cols-12 md:gap-12">
        <div className="relative md:col-span-6">
          <Img k="arch-hero" alt={tm("arch-hero")} pending={tm("pending")} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/5]" parallax={3} />
          <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 text-xs backdrop-blur">
            <MapPin className="size-3.5 text-gold" strokeWidth={1.75} />
            {t("aside")}
          </span>
        </div>
        <div className="md:col-span-6">
          <V3Head label={t("label")} title={t("heading")} id="v3-intro" />
          <Reveal delay={0.1}>
            <p className="mt-6 text-[1.0625rem] leading-[1.75] text-fg/75">{t("lede")}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <blockquote className="mt-8 rounded-[1.5rem] bg-card p-6 md:p-8">
              <span aria-hidden className="block font-luxe text-5xl leading-none text-gold">“</span>
              <p className="-mt-2 font-luxe text-xl leading-[1.5] ">{t("body")}</p>
            </blockquote>
          </Reveal>
        </div>
      </div>

      {/* Architect */}
      <div className="container-editorial mt-12 md:mt-16" style={{ ["--shine-a" as string]: "#c9dcc2", ["--shine-b" as string]: "#ffffff", ["--shine-c" as string]: "#8ea58f" }}>
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-card px-5 py-14 text-center md:px-12 md:py-20">
          {/* Blurred photograph of Aedas' West Kowloon Station, under a deep-green veil */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Image src="/images/aedas/west-kowloon-station-blur.jpg" alt="" fill sizes="100vw" className="scale-110 object-cover object-[72%_40%] md:object-center" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(26_46_36/0.45)_0%,rgb(26_46_36/0.62)_45%,rgb(26_46_36/0.9)_100%)]" />
          {/* Soft sage glow and a faint script watermark */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgb(201_220_194/0.16)_0%,rgb(201_220_194/0)_60%)]" />
          <p aria-hidden className="v3-script pointer-events-none absolute -bottom-[0.25em] left-1/2 -translate-x-1/2 text-[clamp(10rem,32vw,26rem)] leading-none whitespace-nowrap text-accent/[0.05] select-none">
            {t("aedas.name")}
          </p>

          <div className="relative">
            <V3Pill>{t("aedas.label")}</V3Pill>
            <p className="v3-script aedas-shine mt-4 text-[clamp(5rem,13vw,10rem)] leading-[1]">{t("aedas.name")}</p>
            <p className="mx-auto mt-4 max-w-2xl text-[0.9375rem] leading-[1.8] text-fg/75">{t("aedas.body")}</p>

            <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">
              {facts.map((f, i) => {
                const award = i === 1 || i === 2;
                return (
                  <li key={f.value} className="flex flex-col items-center justify-center gap-2 rounded-[1.75rem] border border-gold/20 bg-paper/70 px-4 py-7 backdrop-blur-sm">
                    {award ? (
                      <span className="flex size-12 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/30">
                        <Laurel className="size-8 text-gold" />
                      </span>
                    ) : null}
                    <CountUp value={f.value} className={`font-luxe leading-none ${award ? "text-xl" : "text-[clamp(2.6rem,4vw,3.4rem)] text-accent"}`} />
                    <span className="text-xs leading-snug text-fg/55">{f.label}</span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-10 text-xs text-fg/45">{t("aedas.founder")}</p>
          </div>
          <p className="relative mt-8 text-[0.625rem] text-fg/35 md:absolute md:right-8 md:bottom-5 md:mt-0 md:text-right">
            {t("aedas.photo.caption")} ·{" "}
            <a href="https://commons.wikimedia.org/wiki/File:Southwest_side_of_West_Kowloon_Station_at_night.jpg" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-fg/70 hover:underline">
              {t("aedas.photo.credit")}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* Amenities bento (dark) ─────────────────────────────────────────────────── */
const HIGHLIGHTS = [
  { key: "city", Icon: MapPin },
  { key: "air", Icon: Wind },
  { key: "green", Icon: Leaf },
  { key: "bogd", Icon: Mountain },
  { key: "playground", Icon: ToyBrick },
  { key: "sports", Icon: Dumbbell },
] as const;

export async function V3Amenities() {
  const t = await getTranslations("experience");
  const tm = await getTranslations("media");
  const small: { key: "playground" | "restaurant" | "services"; image: MediaKey }[] = [
    { key: "playground", image: "amenity-playground" },
    { key: "restaurant", image: "amenity-lounge" },
    { key: "services", image: "arch-night" },
  ];
  return (
    <section id={sectionIds.experience} aria-labelledby="v3-exp" className="px-2 md:px-4">
      <div className="rounded-[2.5rem] bg-deep py-section text-white">
        <div className="container-editorial">
          <V3Head label={t("label")} title={t("heading")} id="v3-exp" tone="dark" />
          <ul className="mt-8 flex flex-wrap gap-2">
            {HIGHLIGHTS.map(({ key, Icon }) => (
              <li key={key} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/85">
                <Icon className="size-4 text-gold" strokeWidth={1.5} aria-hidden />
                {t(`highlights.${key}`)}
              </li>
            ))}
          </ul>
          <div className="mt-12 grid gap-3 md:mt-16 md:grid-cols-4 md:grid-rows-2 md:gap-4">
            <article className="relative min-h-[26rem] overflow-hidden rounded-[1.75rem] md:col-span-2 md:row-span-2">
              <div className="absolute inset-0">
                <Img k="amenity-sports" alt={tm("amenity-sports")} pending={tm("pending")} sizes="(min-width: 768px) 50vw, 100vw" className="h-full w-full rounded-none" />
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(35_33_28/0.85),transparent_60%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <h3 className="font-luxe text-3xl font-light">{t("features.sports.title")}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">{t("features.sports.body")}</p>
              </div>
            </article>
            {small.map((f, i) => (
              <article key={f.key} className={`flex flex-col overflow-hidden rounded-[1.75rem] bg-white/5 ${i === 2 ? "md:col-span-2 md:flex-row" : ""}`}>
                <Img k={f.image} alt={tm(f.image)} pending={tm("pending")} sizes="(min-width: 768px) 25vw, 100vw" className={`rounded-none ${i === 2 ? "aspect-[4/3] md:aspect-auto md:w-1/2" : "aspect-[4/3]"}`} />
                <div className="p-5 md:p-6">
                  <h3 className="font-luxe text-xl">{t(`features.${f.key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{t(`features.${f.key}.body`)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Location ───────────────────────────────────────────────────────────────── */
export async function V3Location() {
  const t = await getTranslations("location");
  const tm = await getTranslations("media");
  const locale = (await getLocale()) as Locale;
  const { address, landmarks, mapLink } = siteConfig.location;
  return (
    <section id={sectionIds.location} aria-labelledby="v3-loc" className="bg-paper py-section">
      <div className="container-editorial">
        <div className="grid gap-4 rounded-[2.25rem] bg-card p-3 md:grid-cols-2 md:p-4">
          <div className="overflow-hidden rounded-[1.75rem] bg-white">
            <Img k="location-map" alt={t("mapTitle")} pending={tm("pending")} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/5] rounded-none [&_img]:!object-contain" />
          </div>
          <div className="flex flex-col p-4 md:p-8">
            <V3Head label={t("label")} title={t("heading")} id="v3-loc" intro={t("body")} />
            <div className="mt-8 rounded-[1.25rem] bg-paper p-5">
              <p className="font-mono text-[0.6875rem] tracking-[0.1em] text-fg/50 uppercase">{t("addressLabel")}</p>
              <address className="mt-2 not-italic">{address?.[locale] ?? t("addressPending")}</address>
            </div>
            <p className="mt-8 font-mono text-[0.6875rem] tracking-[0.1em] text-fg/50 uppercase">{t("landmarksLabel")}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {landmarks.map((l) => (
                <li key={l.en} className="rounded-full border border-fg/15 px-3.5 py-1.5 text-sm">
                  {l[locale]}
                </li>
              ))}
            </ul>
            {mapLink ? (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-fg px-5 py-3 text-sm text-paper transition-colors hover:bg-accent md:mt-auto"
              >
                {t("openMap")}
                <ArrowUpRight className="size-4" strokeWidth={1.5} />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Architecture ───────────────────────────────────────────────────────────── */
export async function V3Architecture() {
  const t = await getTranslations("architecture");
  const tm = await getTranslations("media");
  const items: { key: "sculptural" | "glass" | "light"; image: MediaKey }[] = [
    { key: "sculptural", image: "arch-sculptural" },
    { key: "glass", image: "arch-facade" },
    { key: "light", image: "arch-evening" },
  ];
  return (
    <section id={sectionIds.architecture} aria-labelledby="v3-arch" className="bg-paper pb-section">
      <div className="container-editorial">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <V3Head label={t("label")} title={t("heading")} id="v3-arch" intro={t("lede")} />
          <span className="inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-card py-2 pr-5 pl-2 md:self-end">
            <span className="flex size-9 items-center justify-center rounded-full bg-gold font-luxe text-deep ">A</span>
            <span className="text-sm leading-tight">
              <span className="block text-fg/50">{t("credit.label")}</span>
              {t("credit.value")}
            </span>
          </span>
        </div>
        <Img k="arch-curved" alt={tm("arch-curved")} pending={tm("pending")} sizes="100vw" className="mt-12 aspect-[4/3] md:mt-16 md:aspect-[21/9]" parallax={3} />
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal as="li" key={it.key} delay={i * 0.08} className="flex items-center gap-4 rounded-[1.5rem] bg-card p-3 pr-5">
              <Img k={it.image} alt={tm(it.image)} pending={tm("pending")} sizes="120px" className="aspect-square w-24 shrink-0 rounded-[1.1rem]" />
              <div>
                <h3 className="font-luxe text-lg leading-snug">{t(`items.${it.key}.title`)}</h3>
                <p className="mt-1 text-sm text-fg/60">{t(`items.${it.key}.caption`)}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Financing (terracotta) ─────────────────────────────────────────────────── */
export async function V3Financing() {
  const t = await getTranslations("residences.financing");
  const locale = (await getLocale()) as Locale;
  const terms = t.raw("terms") as string[];
  return (
    <section aria-labelledby="v3-fin" className="px-2 py-4 md:px-4">
      <div className="rounded-[2.5rem] bg-forest py-section text-fg">
        <div className="container-editorial grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <V3Head label={t("label")} title={t("heading")} id="v3-fin" tone="dark" />
            <p className="mt-8 font-mono text-[0.6875rem] tracking-[0.1em] text-fg/60 uppercase">{t("partners")}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siteConfig.banks.map((b) => (
                <li key={b.en} className="rounded-full bg-white/10 px-4 py-2 text-sm">
                  {b[locale]}
                </li>
              ))}
            </ul>
          </div>
          <ol className="space-y-3 md:col-span-7">
            {terms.map((term, i) => (
              <Reveal as="li" key={i} delay={i * 0.08} className="flex gap-5 rounded-[1.5rem] bg-white/5 p-5 md:p-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-luxe text-lg text-accent-ink ring-1 ring-gold/70 ring-offset-2 ring-offset-forest">{i + 1}</span>
                <p className="text-[0.9375rem] leading-[1.7]">{term}</p>
              </Reveal>
            ))}
            <p className="px-2 pt-2 text-xs text-fg/60">{t("note")}</p>
          </ol>
        </div>
      </div>
    </section>
  );
}

/* Overview as an accordion ───────────────────────────────────────────────── */
export async function V3Overview() {
  const t = await getTranslations("overview");
  return (
    <section id={sectionIds.overview} aria-labelledby="v3-overview" className="bg-paper py-section">
      <div className="container-editorial grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <V3Head label={t("label")} title={t("heading")} id="v3-overview" intro={t("intro")} />
        </div>
        <ul className="space-y-2 md:col-span-7 md:col-start-6">
          {siteConfig.overviewOrder.map((f, i) => (
            <li key={f}>
              <details className="group rounded-[1.25rem] bg-card open:bg-soft" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 md:px-6 [&::-webkit-details-marker]:hidden">
                  <span className="font-luxe text-lg">{t(`fields.${f}`)}</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-paper transition-transform duration-300 group-open:rotate-45">
                    <Plus className="size-4" strokeWidth={1.5} />
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[0.9375rem] leading-[1.75] text-fg/70 md:px-6">{t(`values.${f}`)}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Contact ────────────────────────────────────────────────────────────────── */
export async function V3Contact() {
  const t = await getTranslations("contact");
  const { email, phone, website } = siteConfig.contact;
  return (
    <section id={sectionIds.contact} aria-labelledby="v3-contact" className="bg-paper pb-section">
      <div className="container-editorial grid gap-4 lg:grid-cols-12">
        <div className="flex flex-col rounded-[2.25rem] bg-soft p-6 md:p-10 lg:col-span-5">
          <V3Head label={t("label")} title={t("heading")} id="v3-contact" intro={t("intro")} />
          <ul className="mt-10 space-y-2 lg:mt-auto">
            {phone ? (
              <li>
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-4 rounded-full bg-card p-2 pr-5 transition-colors hover:bg-soft">
                  <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-ink">
                    <Phone className="size-4" strokeWidth={1.5} />
                  </span>
                  {phone}
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-4 rounded-full bg-card p-2 pr-5 break-all transition-colors hover:bg-soft">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-fg text-paper">
                    <Mail className="size-4" strokeWidth={1.5} />
                  </span>
                  {email}
                </a>
              </li>
            ) : null}
            {website ? <li className="px-4 pt-2 font-mono text-xs text-fg/55">{website}</li> : null}
          </ul>
        </div>
        <div className="on-dark rounded-[2.25rem] bg-card p-6 md:p-10 lg:col-span-7">
          <div>
            <BrochureForm
              brochurePath={siteConfig.brochure.path}
              brochureFilename={siteConfig.brochure.downloadFilename}
              contactEmail={email}
              contactPhone={phone}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
