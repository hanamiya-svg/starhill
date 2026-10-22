import { ArrowUpRight, Dumbbell, MapPin, Mountain, PlugZap, ToyBrick, Wind } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { BrochureForm } from "@/components/sections/BrochureForm";
import { InteriorsStrip } from "@/components/sections/InteriorsStrip";
import { ResidenceFlipCard } from "@/components/sections/ResidenceFlipCard";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { resolveMedia } from "@/lib/media";
import type { MediaKey } from "@/lib/media-registry";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";
import { numeral, roman } from "./nav";
import { V2Head, v2Button } from "./ui";
import { CountUp, Laurel } from "@/components/ui/AedasBits";

type Locale = "mn" | "en";

function Img({ k, alt, sizes, className, pending, parallax = 0 }: { k: MediaKey; alt: string; sizes: string; className: string; pending: string; parallax?: number }) {
  return (
    <ImageReveal className={className} parallax={parallax}>
      <MediaFrame media={resolveMedia(k)} alt={alt} pendingLabel={pending} sizes={sizes} className="h-full w-full" />
    </ImageReveal>
  );
}

/* I · Introduction ───────────────────────────────────────────────────────── */
export async function V2Manifesto() {
  const t = await getTranslations("intro");
  const tm = await getTranslations("media");
  const facts = t.raw("aedas.facts") as { value: string; label: string }[];
  return (
    <section id={sectionIds.introduction} aria-labelledby="v2-intro" className="bg-paper py-section">
      <div className="container-editorial">
        <V2Head numeral={numeral("introduction")} label={t("label")} title={t("heading")} id="v2-intro" intro={t("lede")} align="center" />
        <div className="v2-frame mx-auto mt-16 max-w-6xl md:mt-24">
          <Img k="arch-site-aerial" alt={tm("arch-site-aerial")} pending={tm("pending")} sizes="(min-width: 1200px) 1150px, 100vw" className="aspect-[4/5] sm:aspect-[16/9]" parallax={4} />
        </div>
        <Reveal className="mx-auto mt-16 max-w-2xl text-center md:mt-24">
          <span aria-hidden className="mx-auto block h-12 w-px bg-accent/50" />
          <p className="mt-8 font-luxe text-[clamp(1.5rem,2.4vw,2.1rem)] leading-[1.45] font-light italic">{t("body")}</p>
          <p className="v2-label mt-8 inline-flex items-center gap-2">
            <MapPin className="size-3" strokeWidth={1.5} />
            {t("aside")}
          </p>
        </Reveal>

      </div>

      {/* Architect */}
      <div className="relative mt-20 overflow-hidden md:mt-28">
        <div aria-hidden className="absolute inset-0">
          <Img k="arch-night" alt="" pending={tm("pending")} sizes="100vw" className="h-full w-full" parallax={6} />
        </div>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(11_17_14/0.6)_0%,rgb(11_17_14/0.92)_75%)]" />
        <div className="container-editorial relative py-20 text-center md:py-28">
          <Reveal>
            <p className="flex items-center justify-center gap-4">
              <span aria-hidden className="h-px w-12 bg-accent/60" />
              <span className="v2-label">{t("aedas.label")}</span>
              <span aria-hidden className="h-px w-12 bg-accent/60" />
            </p>
            <p className="aedas-shine mt-8 font-luxe text-[clamp(4.2rem,15vw,12rem)] leading-[0.9] font-light tracking-[0.28em] uppercase [margin-right:-0.28em]">{t("aedas.name")}</p>
            <p className="mx-auto mt-8 max-w-2xl text-[0.9375rem] leading-[1.85] font-light text-fg/80">{t("aedas.body")}</p>
          </Reveal>
          <Reveal delay={0.2} className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-4">
            {facts.map((f, i) => (
              <div key={f.value} className="relative flex flex-col items-center justify-center gap-3 border border-accent/35 bg-paper/40 px-4 py-8 backdrop-blur-md">
                <span aria-hidden className="absolute inset-1.5 border border-accent/15" />
                {i === 1 || i === 2 ? <Laurel className="size-9 text-accent" /> : null}
                <CountUp value={f.value} className={`font-luxe leading-none font-light text-accent ${i === 0 || i === 3 ? "text-5xl" : "text-2xl"}`} />
                <span className="text-[0.625rem] leading-snug tracking-[0.2em] text-fg/60 uppercase">{f.label}</span>
              </div>
            ))}
          </Reveal>
          <p className="mt-10 text-xs font-light tracking-[0.12em] text-fg/45">{t("aedas.founder")}</p>
        </div>
      </div>
    </section>
  );
}

/* II · At a glance ───────────────────────────────────────────────────────── */
export async function V2Facts() {
  const t = await getTranslations("overview");
  const tr = await getTranslations("residences");
  const tn = await getTranslations("nav");
  const { residenceSummary, residences } = siteConfig;
  const stats = [
    { value: residenceSummary.area, label: tr("rooms", { count: residenceSummary.rooms }) },
    { value: String(residences.length), label: t("fields.collections") },
    { value: "B1 — F17", label: tn("plans") },
    { value: siteConfig.architect.name, label: t("fields.architect") },
  ];
  return (
    <section id={sectionIds.overview} aria-labelledby="v2-overview" className="bg-card py-section">
      <div className="container-editorial">
        <V2Head numeral={numeral("overview")} label={t("label")} title={t("heading")} id="v2-overview" intro={t("intro")} />
        <ul className="mt-16 grid grid-cols-2 border-y border-rule md:mt-20 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal as="li" key={i} delay={i * 0.07} className={`px-4 py-8 text-center md:py-12 ${i % 2 ? "border-l border-rule" : ""} ${i === 2 ? "border-t border-rule lg:border-t-0 lg:border-l" : ""} ${i === 3 ? "border-t border-rule lg:border-t-0" : ""}`}>
              <p className="font-luxe text-[clamp(1.8rem,3.2vw,3rem)] leading-none font-light">{s.value}</p>
              <p className="v2-label mt-4 !tracking-[0.24em] text-muted">{s.label}</p>
            </Reveal>
          ))}
        </ul>
        <dl className="mx-auto mt-16 max-w-4xl md:mt-20">
          {siteConfig.overviewOrder.map((f) => (
            <div key={f} className="grid gap-2 border-b border-rule py-5 sm:grid-cols-[12rem_1fr] sm:gap-10">
              <dt className="v2-label pt-1">{t(`fields.${f}`)}</dt>
              <dd className="text-[0.9375rem] leading-[1.8] font-light text-fg/80">{t(`values.${f}`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* III · Residences ───────────────────────────────────────────────────────── */
export async function V2Residences() {
  const t = await getTranslations("residences");
  const tm = await getTranslations("media");
  const { residences, residenceSummary } = siteConfig;
  return (
    <section id={sectionIds.residences} aria-labelledby="v2-res" className="bg-paper py-section">
      <div className="container-editorial">
        <V2Head
          numeral={numeral("residences")}
          label={t("label")}
          title={t("heading")}
          id="v2-res"
          intro={t("intro", { rooms: residenceSummary.rooms, area: residenceSummary.area })}
          align="center"
        />
        <ol className="mt-16 grid gap-16 md:mt-24 md:grid-cols-3 md:gap-10">
          {residences.map((r, i) => (
            <Reveal as="li" key={r.id} delay={i * 0.1} y={24} className="flex flex-col">
              <ResidenceFlipCard
                className="aspect-[3/4]"
                front={<MediaFrame media={resolveMedia(r.image)} alt={tm(r.image)} pendingLabel={tm("pending")} sizes="(min-width: 768px) 33vw, 100vw" className="h-full w-full" />}
                plan={{ ...r.plan, alt: t("planAlt", { name: r.name }) }}
                labels={{ showPlan: t("showPlan"), showPhoto: t("showPhoto"), planTag: t("example", { area: r.example }) }}
              />
              <div className="mt-8 text-center">
                <p className="font-luxe text-sm text-accent italic">{roman(i + 1)}</p>
                <h3 className="mt-2 font-luxe text-[clamp(2.2rem,3vw,3rem)] leading-none font-light">{r.name}</h3>
                <dl className="mx-auto mt-5 max-w-[16rem] border-t border-rule">
                  {r.sizes.map((sz) => (
                    <div key={sz.rooms} className="flex justify-between gap-4 border-b border-rule py-2 text-xs font-light">
                      <dt className="v2-label !text-fg/60">{t("rooms", { count: sz.rooms })}</dt>
                      <dd className="tabular-nums text-fg/85">{sz.area}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mx-auto mt-6 max-w-sm text-sm leading-[1.85] font-light text-muted">{t(`collections.${r.id}.body`)}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <InteriorsStrip label={t("interiors")} note={t("interiorsNote")} className="mt-24 font-light md:mt-32" labelClassName="v2-label" frameClassName="border border-rule" />
      </div>
    </section>
  );
}

/* V · Architecture ───────────────────────────────────────────────────────── */
export async function V2Architecture() {
  const t = await getTranslations("architecture");
  const tm = await getTranslations("media");
  const items: { key: "sculptural" | "glass" | "light"; image: MediaKey }[] = [
    { key: "sculptural", image: "land-terraces" },
    { key: "glass", image: "arch-street-tower" },
    { key: "light", image: "arch-tower-day" },
  ];
  return (
    <section id={sectionIds.architecture} aria-labelledby="v2-arch" className="bg-paper pb-section">
      <div className="relative">
        <Img k="arch-night-stars" alt={tm("arch-night-stars")} pending={tm("pending")} sizes="100vw" className="aspect-[3/4] w-full sm:aspect-[16/9] lg:aspect-[21/9]" parallax={6} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgb(11_17_14)_0%,rgb(11_17_14/0.4)_35%,rgb(11_17_14/0)_65%)]" />
        <div className="container-editorial absolute inset-x-0 bottom-0 pb-4 md:pb-10">
          <V2Head numeral={numeral("architecture")} label={t("label")} title={t("heading")} id="v2-arch" />
        </div>
      </div>
      <div className="container-editorial">
        <div className="mt-10 grid gap-8 border-t border-rule pt-10 md:grid-cols-12">
          <p className="text-[0.9375rem] leading-[1.85] font-light text-muted md:col-span-6">{t("lede")}</p>
          <p className="md:col-span-5 md:col-start-8">
            <span className="v2-label block">{t("credit.label")}</span>
            <span className="mt-3 block font-luxe text-2xl font-light">{t("credit.value")}</span>
          </p>
        </div>
        <ul className="mt-16 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-10">
          {items.map((it, i) => (
            <Reveal as="li" key={it.key} delay={i * 0.08}>
              <Img k={it.image} alt={tm(it.image)} pending={tm("pending")} sizes="(min-width: 768px) 30vw, 100vw" className="aspect-[4/5]" />
              <p className="mt-6 font-luxe text-sm text-accent italic">{roman(i + 1)}</p>
              <h3 className="mt-1 font-luxe text-2xl font-light">{t(`items.${it.key}.title`)}</h3>
              <p className="mt-2 text-sm font-light text-muted">{t(`items.${it.key}.caption`)}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* VI · Amenities ─────────────────────────────────────────────────────────── */
const HIGHLIGHTS = [
  { key: "trail", Icon: Mountain },
  { key: "playground", Icon: ToyBrick },
  { key: "sports", Icon: Dumbbell },
  { key: "city", Icon: MapPin },
  { key: "air", Icon: Wind },
  { key: "ev", Icon: PlugZap },
] as const;

export async function V2Amenities() {
  const t = await getTranslations("experience");
  const tm = await getTranslations("media");
  const features: { key: "sports" | "fitness" | "grounds" | "concierge"; image: MediaKey }[] = [
    { key: "sports", image: "amenity-sports-sunset" },
    { key: "fitness", image: "amenity-fitness" },
    { key: "grounds", image: "amenity-playground-aerial" },
    { key: "concierge", image: "amenity-concierge" },
  ];
  return (
    <section id={sectionIds.experience} aria-labelledby="v2-exp" className="bg-card py-section">
      <div className="container-editorial">
        <V2Head numeral={numeral("experience")} label={t("label")} title={t("heading")} id="v2-exp" align="center" />
        <ul className="mt-14 grid grid-cols-3 border-y border-rule md:mt-20 lg:grid-cols-6">
          {HIGHLIGHTS.map(({ key, Icon }, i) => (
            <li key={key} className={`flex flex-col items-center gap-4 px-2 py-7 text-center ${i % 3 ? "border-l border-rule" : ""} ${i >= 3 ? "border-t border-rule lg:border-t-0" : ""} ${i === 3 ? "lg:border-l" : ""}`}>
              <Icon className="size-5 text-accent" strokeWidth={1} aria-hidden />
              <span className="text-xs leading-snug font-light text-fg/80">{t(`highlights.${key}`)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-16 grid gap-x-10 gap-y-16 md:mt-24 md:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.key} delay={(i % 2) * 0.1} className={i % 2 ? "md:mt-24" : ""}>
              <div className={i % 2 ? "" : "v2-frame"}>
                <Img k={f.image} alt={tm(f.image)} pending={tm("pending")} sizes="(min-width: 768px) 45vw, 100vw" className="aspect-[4/3]" />
              </div>
              <h3 className="mt-8 font-luxe text-3xl font-light">{t(`features.${f.key}.title`)}</h3>
              <p className="mt-3 max-w-md text-sm leading-[1.85] font-light text-muted">{t(`features.${f.key}.body`)}</p>
            </Reveal>
          ))}
        </div>
        <div className="mx-auto mt-20 max-w-4xl text-center md:mt-28">
          <p className="v2-label">{t("facilitiesLabel")}</p>
          <p className="mt-6 font-luxe text-[clamp(1.15rem,1.8vw,1.5rem)] leading-[1.9] font-light text-fg/85">
            {(t.raw("facilities") as string[]).map((f, i) => (
              <span key={f}>
                {i ? <span aria-hidden className="px-3 text-accent">·</span> : null}
                {f}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

/* VII · Nature ───────────────────────────────────────────────────────────── */
export async function V2Nature() {
  const t = await getTranslations("nature");
  const tm = await getTranslations("media");
  return (
    <section id={sectionIds.nature} aria-labelledby="v2-nature" className="bg-paper py-section">
      <div className="container-editorial grid items-center gap-14 md:grid-cols-12 md:gap-10">
        <div className="v2-frame md:col-span-7">
          <Img k="land-hills" alt={tm("land-hills")} pending={tm("pending")} sizes="(min-width: 768px) 58vw, 100vw" className="aspect-[4/5] md:aspect-[4/3]" parallax={4} />
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <V2Head numeral={numeral("nature")} label={t("label")} title={t("heading")} id="v2-nature" intro={t("body")} />
          <dl className="mt-10 grid grid-cols-2 border-t border-rule">
            {(t.raw("stats") as { value: string; label: string }[]).map((st, i) => (
              <div key={st.label} className={`flex flex-col-reverse gap-1 border-b border-rule py-4 ${i % 2 ? "border-l pl-4" : ""}`}>
                <dt className="v2-label !text-[0.5625rem] !text-fg/55">{st.label}</dt>
                <dd className="font-luxe text-2xl font-light text-accent">{st.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {(["land-plaza", "land-street-walk"] as const).map((k, i) => (
              <figure key={k}>
                <Img k={k} alt={tm(k)} pending={tm("pending")} sizes="20vw" className="aspect-square" />
                <figcaption className="mt-3 text-[0.6875rem] font-light text-muted">{t(i ? "captions.street" : "captions.grounds")}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* VIII · Location ────────────────────────────────────────────────────────── */
export async function V2Location() {
  const t = await getTranslations("location");
  const tm = await getTranslations("media");
  const locale = (await getLocale()) as Locale;
  const { address, landmarks, mapLink } = siteConfig.location;
  return (
    <section id={sectionIds.location} aria-labelledby="v2-loc" className="bg-card py-section">
      <div className="container-editorial grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <V2Head numeral={numeral("location")} label={t("label")} title={t("heading")} id="v2-loc" intro={t("body")} />
          <div className="mt-12 border-t border-rule pt-8">
            <p className="v2-label">{t("addressLabel")}</p>
            <address className="mt-3 font-luxe text-xl leading-snug font-light not-italic">{address?.[locale] ?? t("addressPending")}</address>
            <p className="v2-label mt-6">{t("officeLabel")}</p>
            <p className="mt-3 font-luxe text-xl font-light">{siteConfig.contact.office[locale]}</p>
          </div>
          <div className="mt-10">
            <p className="v2-label">{t("landmarksLabel")}</p>
            <ol className="mt-4">
              {landmarks.map((l, i) => (
                <li key={l.en} className="flex items-baseline gap-4 border-b border-rule py-3 text-sm font-light">
                  <span className="w-8 font-luxe text-accent italic">{roman(i + 1)}</span>
                  {l[locale]}
                </li>
              ))}
            </ol>
          </div>
          {mapLink ? (
            <a href={mapLink} target="_blank" rel="noopener noreferrer" className={`${v2Button} mt-10`}>
              {t("openMap")}
              <ArrowUpRight className="size-3.5" strokeWidth={1.25} />
            </a>
          ) : null}
        </div>
        <div className="v2-frame md:col-span-6 md:col-start-7">
          <div className="bg-ivory p-3">
            <Img k="location-map" alt={t("mapTitle")} pending={tm("pending")} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/5] [&_img]:!object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Financing ──────────────────────────────────────────────────────────────── */
export async function V2Financing() {
  const t = await getTranslations("residences.financing");
  const locale = (await getLocale()) as Locale;
  const terms = t.raw("terms") as string[];
  return (
    <section aria-labelledby="v2-fin" className="bg-deep py-section">
      <div className="container-editorial">
        <V2Head numeral="§" label={t("label")} title={t("heading")} id="v2-fin" intro={t("intro")} align="center" />
        <ol className="mt-16 grid gap-px md:mt-20 md:grid-cols-3">
          {terms.map((term, i) => (
            <Reveal as="li" key={i} delay={i * 0.08} className={`px-2 py-8 text-center md:px-8 ${i ? "border-t border-rule md:border-t-0 md:border-l" : ""}`}>
              <span className="font-luxe text-5xl font-light text-accent italic">{roman(i + 1)}</span>
              <p className="mt-6 text-[0.9375rem] leading-[1.85] font-light text-fg/80">{term}</p>
            </Reveal>
          ))}
        </ol>
        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <p className="v2-label">{t("partners")}</p>
          <p className="font-luxe text-xl font-light">{siteConfig.banks.map((b) => b[locale]).join("  ·  ")}</p>
          <p className="mt-2 max-w-md text-xs font-light text-muted">{t("note")}</p>
        </div>
      </div>
    </section>
  );
}

/* IX · Contact ───────────────────────────────────────────────────────────── */
export async function V2Contact() {
  const t = await getTranslations("contact");
  const { email, phone, website } = siteConfig.contact;
  return (
    <section id={sectionIds.contact} aria-labelledby="v2-contact" className="bg-paper py-section">
      <div className="container-editorial grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <V2Head numeral={numeral("contact")} label={t("label")} title={t("heading")} id="v2-contact" intro={t("intro")} />
          <ul className="mt-12 space-y-6 border-t border-rule pt-8">
            {phone ? (
              <li>
                <p className="v2-label">{t("direct.phone")}</p>
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="mt-2 block font-luxe text-2xl font-light hover:text-accent">
                  {phone}
                </a>
              </li>
            ) : null}
            {email ? (
              <li>
                <p className="v2-label">{t("direct.email")}</p>
                <a href={`mailto:${email}`} className="mt-2 block font-luxe text-2xl font-light break-all hover:text-accent">
                  {email}
                </a>
              </li>
            ) : null}
            {website ? (
              <li>
                <p className="v2-label">{t("direct.website")}</p>
                <p className="mt-2 font-luxe text-2xl font-light">{website}</p>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="on-dark border border-rule bg-card p-6 md:p-12 lg:col-span-7 lg:col-start-6">
          <BrochureForm brochurePath={siteConfig.brochure.path} brochureFilename={siteConfig.brochure.downloadFilename} contactEmail={email} contactPhone={phone} />
        </div>
      </div>
    </section>
  );
}
