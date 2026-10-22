"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { CountUp, Laurel } from "@/components/ui/AedasBits";

export type AedasProfile = {
  title: string;
  photoAlt: string;
  general: { label: string; body: string; stats: { value: string; label: string }[]; officesLabel: string; offices: string[] };
  founder: { label: string; name: string; role: string; portraitAlt: string; body: string; starHillLabel: string; starHill: string };
  projects: {
    label: string;
    featured: { image: string; name: string; place: string; area: string; body: string }[];
    items: { name: string; city: string; area?: string; status?: string; note: string }[];
  };
  awards: { label: string; highlightsLabel: string; highlights: { year: string; name: string; result: string }[] };
};

type Tab = "general" | "founder" | "projects" | "awards";
const TABS: Tab[] = ["general", "founder", "projects", "awards"];
const EASE = [0.22, 1, 0.36, 1] as const;

/** Large photograph that changes with the tab (projects show two), beside the tabbed company profile. */
export function V4Aedas({
  profile: p,
  aedas,
  tabs,
  captions,
}: {
  profile: AedasProfile;
  aedas: { label: string; name: string; founder: string };
  tabs: Record<Tab, string>;
  captions: Record<Tab, string>;
}) {
  const [tab, setTab] = useState<Tab>("general");
  const reduce = useReducedMotion();
  const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: reduce ? 0 : 0.6, ease: EASE } };

  const photos: Record<Exclude<Tab, "projects">, { src: string; alt: string; pos: string }> = {
    general: { src: "/images/aedas/new-huanggang-port.jpg", alt: p.photoAlt, pos: "50% 50%" },
    founder: { src: "/images/aedas/keith-griffiths.jpg", alt: p.founder.portraitAlt, pos: "50% 22%" },
    awards: { src: "/images/aedas/west-kowloon-station-blur.jpg", alt: "", pos: "60% 50%" },
  };

  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)] lg:min-h-[100svh] lg:grid-cols-2"
      style={{ ["--shine-a" as string]: "#cbbd8f", ["--shine-b" as string]: "#fbf3d6", ["--shine-c" as string]: "#8f7a48" }}
    >
      {/* Photograph */}
      <figure className="relative aspect-[4/5] overflow-hidden bg-obsidian sm:aspect-[16/10] lg:aspect-auto">
        <AnimatePresence initial={false}>
          <motion.div key={tab} className="absolute inset-0" {...fade}>
            {tab === "projects" ? (
              <div className="grid h-full grid-cols-2 gap-px bg-forest">
                {p.projects.featured.map((f) => (
                  <div key={f.name} className="relative">
                    <Image src={f.image} alt={f.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <Image src={photos[tab].src} alt={photos[tab].alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" style={{ objectPosition: photos[tab].pos }} />
            )}
          </motion.div>
        </AnimatePresence>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgb(17_20_18/0.7),transparent)]" />
        <figcaption className="label-caps absolute bottom-5 left-5 text-[0.625rem] text-ivory/80 md:bottom-8 md:left-8">{captions[tab]}</figcaption>
      </figure>

      {/* Profile */}
      <div className="flex flex-col px-gutter py-14 lg:px-14 lg:py-20 xl:px-20">
        <p className="label-caps flex items-center gap-4 text-champagne">
          <span aria-hidden className="h-px w-12 bg-champagne/60" />
          {aedas.label}
        </p>
        <p className="aedas-shine mt-5 font-luxe text-[clamp(3.6rem,8vw,7rem)] leading-[0.85] tracking-[0.04em] uppercase">{aedas.name}</p>
        <p className="label-caps mt-4 text-ivory/55">{p.title}</p>

        <div role="tablist" aria-label={p.title} className="mt-10 flex gap-6 overflow-x-auto border-b border-ivory/15 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              id={`v4-aedas-tab-${k}`}
              aria-selected={tab === k}
              aria-controls="v4-aedas-panel"
              onClick={() => setTab(k)}
              className={`relative shrink-0 pb-3 text-sm transition-colors ${tab === k ? "text-ivory" : "text-ivory/50 hover:text-ivory/80"}`}
            >
              {tabs[k]}
              {tab === k ? <motion.span layoutId="v4-aedas-tab" className="absolute inset-x-0 -bottom-px h-px bg-champagne" /> : null}
            </button>
          ))}
        </div>

        <div id="v4-aedas-panel" role="tabpanel" aria-labelledby={`v4-aedas-tab-${tab}`} className="relative mt-8 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}>
              {tab === "general" ? (
                <>
                  <p className="text-[0.9375rem] leading-[1.85] text-ivory/80">{p.general.body}</p>
                  <dl className="mt-8 grid grid-cols-2 gap-px bg-ivory/15 sm:grid-cols-4">
                    {p.general.stats.map((st, i) => (
                      <div key={st.label} className="flex flex-col-reverse gap-2 bg-forest p-4">
                        <dt className="text-xs leading-snug text-ivory/55">{st.label}</dt>
                        <dd className="font-luxe text-3xl leading-none text-champagne md:text-4xl">{i === 0 ? st.value : <CountUp value={st.value} />}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="label-caps mt-8 text-ivory/50">{p.general.officesLabel}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {p.general.offices.map((o) => (
                      <li key={o} className="border border-ivory/20 px-3 py-1.5 text-xs text-ivory/85">
                        {o}
                      </li>
                    ))}
                  </ul>
                </>
              ) : tab === "founder" ? (
                <>
                  <p className="font-luxe text-[clamp(2rem,3.4vw,2.8rem)] leading-tight">{p.founder.name}</p>
                  <p className="label-caps mt-2 text-champagne">{p.founder.role}</p>
                  <p className="mt-5 text-[0.9375rem] leading-[1.85] text-ivory/80">{p.founder.body}</p>
                  <div className="mt-6 border-l-2 border-champagne pl-5">
                    <p className="label-caps text-champagne">{p.founder.starHillLabel}</p>
                    <p className="mt-2 text-[0.9375rem] leading-[1.85] text-ivory/85">{p.founder.starHill}</p>
                  </div>
                </>
              ) : tab === "projects" ? (
                <>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {p.projects.featured.map((f) => (
                      <li key={f.name} className="border-t border-champagne/40 pt-4">
                        <p className="font-luxe text-xl leading-snug">{f.name}</p>
                        <p className="label-caps mt-1 text-[0.625rem] text-champagne">
                          {f.place} · {f.area}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-ivory/70">{f.body}</p>
                      </li>
                    ))}
                  </ul>
                  <ol className="mt-6 border-t border-ivory/15">
                    {p.projects.items.map((pr) => (
                      <li key={pr.name} className="flex items-baseline justify-between gap-4 border-b border-ivory/15 py-3">
                        <div className="min-w-0">
                          <p className="font-luxe text-lg leading-snug">{pr.name}</p>
                          <p className="mt-0.5 text-xs text-ivory/60">{[pr.city, pr.note].join(" · ")}</p>
                        </div>
                        {pr.area ? <span className="shrink-0 text-xs whitespace-nowrap text-champagne">{pr.area}</span> : null}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <ol className="grid grid-cols-2 gap-px bg-champagne/25 sm:grid-cols-3">
                  {p.awards.highlights.map((aw) => (
                    <li key={aw.year + aw.name} className="flex flex-col items-center gap-2 bg-forest px-3 py-6 text-center">
                      <Laurel className="size-10 text-champagne" />
                      <span className="font-luxe text-2xl leading-none text-champagne">{aw.year}</span>
                      <span className="text-xs leading-snug text-ivory">{aw.name}</span>
                      <span className="text-[0.6875rem] leading-snug text-ivory/60">{aw.result}</span>
                    </li>
                  ))}
                </ol>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="mt-10 text-xs text-ivory/45">{aedas.founder}</p>
      </div>
    </div>
  );
}
