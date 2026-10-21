import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import { sectionIds } from "@/lib/navigation";
import { CountUp, Laurel } from "@/components/ui/AedasBits";

type AedasProfile = {
  title: string;
  photoAlt: string;
  general: {
    label: string;
    body: string;
    stats: { value: string; label: string }[];
    officesLabel: string;
    offices: string[];
    timelineLabel: string;
    timeline: { year: string; place: string }[];
    market: string;
  };
  founder: { label: string; name: string; role: string; portraitAlt: string; body: string; starHillLabel: string; starHill: string };
  projects: {
    label: string;
    featured: { image: string; name: string; place: string; area: string; body: string }[];
    items: { name: string; city: string; area: string; status: string; note: string }[];
  };
  awards: {
    label: string;
    headline: { value: string; label: string };
    summary: string;
    highlightsLabel: string;
    highlights: { year: string; name: string; result: string }[];
    items: { year: string; name: string; result: string }[];
  };
};

/** "01 — Label" with a hairline running to the edge. */
function ProfileHeading({ index, label }: { index: string; label: string }) {
  return (
    <h3 className="flex items-center gap-4">
      <span className="font-luxe text-2xl text-champagne tabular-nums">{index}</span>
      <span className="font-luxe text-2xl leading-tight md:text-3xl">{label}</span>
      <span aria-hidden className="h-px flex-1 bg-ivory/15" />
    </h3>
  );
}

export async function EditorialIntro() {
  const t = await getTranslations("intro");
  const tMedia = await getTranslations("media");
  const image = resolveMedia("arch-campus-street");
  const p = t.raw("aedasProfile") as AedasProfile;

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

        {/* Architect — Aedas profile: overview · founder · major projects · awards */}
        <div
          className="relative -mx-gutter mt-20 bg-forest text-ivory md:mx-0 md:mt-28"
          style={{ ["--shine-a" as string]: "#cbbd8f", ["--shine-b" as string]: "#fbf3d6", ["--shine-c" as string]: "#8f7a48" }}
        >
          <div className="px-6 py-16 md:px-14 md:py-24">
            <Reveal className="max-w-3xl">
              <p className="label-caps flex items-center gap-4 text-champagne">
                <span aria-hidden className="h-px w-12 bg-champagne/60" />
                {t("aedas.label")}
              </p>
              <p className="aedas-shine mt-6 font-luxe text-[clamp(4rem,12vw,9.5rem)] leading-[0.85] tracking-[0.04em] uppercase">{t("aedas.name")}</p>
              <p className="label-caps mt-6 text-ivory/60">{p.title}</p>
            </Reveal>

            <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-14">
              {/* Photo */}
              <figure className="lg:col-span-5">
                <div className="lg:sticky lg:top-28">
                  <ImageReveal className="relative mx-auto aspect-[1400/1976] w-full max-w-[460px] border border-champagne/30 p-2" parallax={0}>
                    <span className="relative block h-full w-full">
                      <Image src="/images/aedas/new-huanggang-port.jpg" alt={p.photoAlt} fill sizes="(min-width: 1024px) 460px, 90vw" className="object-cover" />
                    </span>
                  </ImageReveal>
                </div>
              </figure>

              <div className="space-y-16 lg:col-span-7">
                {/* 01 · Overview */}
                <Reveal>
                  <ProfileHeading index="01" label={p.general.label} />
                  <p className="mt-5 text-[0.9375rem] leading-[1.85] text-ivory/80">{p.general.body}</p>
                  <dl className="mt-8 grid grid-cols-2 gap-px bg-ivory/15 sm:grid-cols-4">
                    {p.general.stats.map((st, i) => (
                      <div key={st.label} className="flex flex-col-reverse gap-2 bg-forest p-4">
                        <dt className="text-xs leading-snug text-ivory/55">{st.label}</dt>
                        <dd className="font-luxe text-3xl leading-none text-champagne md:text-4xl">
                          {i === 0 ? st.value : <CountUp value={st.value} />}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div>
                      <p className="label-caps text-ivory/50">{p.general.officesLabel}</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {p.general.offices.map((o) => (
                          <li key={o} className="border border-ivory/20 px-3 py-1.5 text-xs text-ivory/85">{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="label-caps text-ivory/50">{p.general.timelineLabel}</p>
                      <ol className="relative mt-4 flex justify-between gap-2 before:absolute before:top-[5px] before:right-0 before:left-0 before:h-px before:bg-champagne/40">
                        {p.general.timeline.map((tl) => (
                          <li key={tl.year + tl.place} className="relative flex flex-col items-start gap-2">
                            <span aria-hidden className="size-[11px] rounded-full border border-champagne bg-forest" />
                            <span className="font-luxe text-sm text-champagne">{tl.year}</span>
                            <span className="text-xs text-ivory/75">{tl.place}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  <p className="mt-6 text-xs text-ivory/55">{p.general.market}</p>
                </Reveal>

                {/* 02 · Founder */}
                <Reveal>
                  <ProfileHeading index="02" label={p.founder.label} />
                  <div className="mt-6 grid gap-6 sm:grid-cols-[11rem_1fr] sm:gap-8">
                    <div className="relative aspect-[900/1272] w-40 border border-champagne/30 p-1.5 sm:w-full">
                      <span className="relative block h-full w-full overflow-hidden">
                        <Image src="/images/aedas/keith-griffiths.jpg" alt={p.founder.portraitAlt} fill sizes="176px" className="object-cover grayscale-[0.25]" />
                      </span>
                    </div>
                    <div className="border-l-2 border-champagne pl-6">
                      <p className="font-luxe text-[clamp(2rem,3.4vw,2.8rem)] leading-tight">{p.founder.name}</p>
                      <p className="label-caps mt-2 text-champagne">{p.founder.role}</p>
                      <p className="mt-4 max-w-xl text-[0.9375rem] leading-[1.85] text-ivory/80">{p.founder.body}</p>
                    </div>
                  </div>
                  <div className="mt-6 border border-champagne/30 bg-ivory/[0.04] p-5 md:p-6">
                    <p className="label-caps text-champagne">{p.founder.starHillLabel}</p>
                    <p className="mt-3 text-[0.9375rem] leading-[1.85] text-ivory/85">{p.founder.starHill}</p>
                  </div>
                </Reveal>

                {/* 03 · Major projects */}
                <Reveal>
                  <ProfileHeading index="03" label={p.projects.label} />
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {p.projects.featured.map((pr) => (
                      <li key={pr.name} className="group flex flex-col border border-ivory/15 bg-ivory/[0.03]">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image src={pr.image} alt={pr.name} fill sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.04]" />
                          <span className="absolute top-3 left-3 bg-forest/85 px-2.5 py-1 font-luxe text-sm text-champagne backdrop-blur">{pr.area}</span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <p className="font-luxe text-xl leading-snug">{pr.name}</p>
                          <p className="label-caps mt-2 text-[0.625rem] text-champagne">{pr.place}</p>
                          <p className="mt-3 text-sm leading-relaxed text-ivory/70">{pr.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <ol className="mt-6 border-t border-ivory/15">
                    {p.projects.items.map((pr, i) => (
                      <li key={pr.name} className="grid grid-cols-[2rem_1fr] gap-x-4 gap-y-2 border-b border-ivory/15 py-4 sm:grid-cols-[2rem_1fr_auto]">
                        <span className="label-caps pt-1 text-champagne tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                        <div className="min-w-0">
                          <p className="font-luxe text-lg leading-snug">{pr.name}</p>
                          <p className="mt-1 text-xs text-ivory/60">
                            {pr.city} · {pr.area} · {pr.note}
                          </p>
                        </div>
                        <span className="col-start-2 self-start justify-self-start border border-champagne/40 px-2.5 py-1 text-[0.6875rem] whitespace-nowrap text-champagne sm:col-start-auto sm:justify-self-end">
                          {pr.status}
                        </span>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                {/* 04 · Awards */}
                <Reveal>
                  <ProfileHeading index="04" label={p.awards.label} />
                  <p className="label-caps mt-6 text-ivory/50">{p.awards.highlightsLabel}</p>
                  <ol className="mt-4 grid grid-cols-2 gap-px bg-champagne/25 sm:grid-cols-5 [&>li:last-child]:col-span-2 sm:[&>li:last-child]:col-span-1">
                    {p.awards.highlights.map((aw) => (
                      <li key={aw.name} className="flex flex-col items-center gap-2 bg-forest px-3 py-6 text-center">
                        <Laurel className="size-10 text-champagne" />
                        <span className="font-luxe text-2xl leading-none text-champagne">{aw.year}</span>
                        <span className="text-xs leading-snug text-ivory">{aw.name}</span>
                        <span className="text-[0.6875rem] leading-snug text-ivory/60">{aw.result}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-6 flex flex-col gap-6 border border-champagne/30 p-6 sm:flex-row sm:items-center">
                    <div className="flex shrink-0 items-center gap-4">
                      <Laurel className="size-14 text-champagne" />
                      <div>
                        <CountUp value={p.awards.headline.value} className="block font-luxe text-5xl leading-none text-champagne" />
                        <span className="mt-1 block text-xs text-ivory/60">{p.awards.headline.label}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-ivory/75">{p.awards.summary}</p>
                  </div>
                  <ol className="mt-6 border-t border-ivory/15">
                    {p.awards.items.map((aw) => (
                      <li key={aw.name} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-ivory/15 py-4">
                        <span className="self-start border border-champagne/40 px-2 py-1 text-center font-luxe text-sm text-champagne">{aw.year}</span>
                        <div>
                          <p className="font-luxe text-lg leading-snug">{aw.name}</p>
                          <p className="mt-1 text-sm leading-relaxed text-ivory/65">{aw.result}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 text-xs text-ivory/45">{t("aedas.founder")}</p>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
