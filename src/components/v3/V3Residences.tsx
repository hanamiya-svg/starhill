"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { ResidenceFlipCard } from "@/components/sections/ResidenceFlipCard";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";
import { V3Head } from "./ui";

type Residence = (typeof siteConfig.residences)[number];

/** One collection at a time behind a pill switch; the card flips to its plan. */
export function V3Residences({ photos, intro, children }: { photos: Record<string, ReactNode>; intro: string; children?: ReactNode }) {
  const t = useTranslations("residences");
  const tn = useTranslations("nav");
  const reduce = useReducedMotion();
  const list = siteConfig.residences;
  const [active, setActive] = useState<Residence["id"]>(list[1].id);
  const r = list.find((x) => x.id === active)!;

  return (
    <section id={sectionIds.residences} aria-labelledby="v3-res" className="bg-paper py-section">
      <div className="container-editorial">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <V3Head label={t("label")} title={t("heading")} id="v3-res" intro={intro} />
          <div role="tablist" aria-label={t("label")} className="flex max-w-full self-start overflow-x-auto rounded-full bg-soft p-1.5 [scrollbar-width:none] md:self-end [&::-webkit-scrollbar]:hidden">
            {list.map((x) => {
              const on = x.id === active;
              return (
                <button
                  key={x.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setActive(x.id)}
                  className="relative shrink-0 rounded-full px-3.5 py-2.5 text-sm md:px-6"
                >
                  {on ? (
                    <motion.span layoutId="v3-res-pill" className="absolute inset-0 rounded-full bg-card shadow-sm ring-1 ring-gold/50" transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }} />
                  ) : null}
                  <span className={`relative ${on ? "text-fg" : "text-fg/55"}`}>{x.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={r.id}
            role="tabpanel"
            initial={{ opacity: 0, y: reduce ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid items-center gap-8 rounded-[2.25rem] bg-card p-3 md:mt-14 md:grid-cols-12 md:gap-10 md:p-4"
          >
            <div className="md:col-span-6">
              <ResidenceFlipCard
                className="aspect-[4/5] md:aspect-square"
                front={photos[r.id]}
                plan={{ ...r.plan, alt: t("planAlt", { name: r.name }) }}
                labels={{ showPlan: t("showPlan"), showPhoto: t("showPhoto"), planTag: t("example", { area: r.example }) }}
              />
            </div>
            <div className="px-3 pb-5 md:col-span-6 md:px-4 md:pb-0">
              <p className="font-mono text-[0.6875rem] tracking-[0.1em] text-gold uppercase">{t(`collections.${r.id}.subtitle`)}</p>
              <h3 className="v3-script mt-2 text-[clamp(3.6rem,7vw,6.5rem)]">{r.name}</h3>
              <ul className="mt-6 flex flex-wrap gap-2 text-sm">
                {r.sizes.map((sz) => (
                  <li key={sz.rooms} className="rounded-full bg-paper px-4 py-2">
                    <span className="text-gold">{t("rooms", { count: sz.rooms })}</span> · {sz.area}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-md text-[0.9375rem] leading-[1.75] text-fg/70">{t(`collections.${r.id}.body`)}</p>
              <a href={`#${sectionIds.contact}`} className="group mt-8 inline-flex items-center gap-3 rounded-full bg-fg py-2 pr-2 pl-5 text-sm text-paper transition-colors hover:bg-accent">
                {tn("cta")}
                <span className="flex size-8 items-center justify-center rounded-full bg-white/15">
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
                </span>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
        {children}
      </div>
    </section>
  );
}
