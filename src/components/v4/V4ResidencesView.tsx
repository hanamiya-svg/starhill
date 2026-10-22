"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Layers, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PlanLightbox, type LightboxItem } from "./sections/PlanLightbox";
import { sectionIds } from "./navigation";

export type V4Plan = { id: string; src: string; width: number; height: number; label: string; meta: string; short: string; unoptimized?: boolean };
export type V4Shot = { id: string; src: string; focus: string; alt: string; width: number; height: number; title?: string };
export type V4Collection = {
  id: string;
  name: string;
  subtitle: string;
  body: string;
  photo: { src: string; focus: string; alt: string };
  sizes: { rooms: string; area: string }[];
  /** No 2026 plan sheet yet: show the brochure / 3D plans with a note. */
  pending: boolean;
  plans: V4Plan[];
};

type Copy = Record<
  "label" | "heading" | "lede" | "plans" | "openPlan" | "status2026" | "statusPending" | "sizesNote" | "floorsButton" | "interiors" | "financingLabel" | "partners" | "note",
  string
>;
type Viewer = Parameters<typeof PlanLightbox>[0]["labels"];
type Box = { kind: "plan" | "interior" | "floor"; index: number } | null;

const EASE = [0.22, 1, 0.36, 1] as const;

/** Орон сууц: four collection tabs; each shows a large interior beside a large, zoomable plan with a plan picker. */
export function V4ResidencesView({
  collections,
  interiors,
  floors,
  terms,
  banks,
  copy,
  viewer,
}: {
  collections: V4Collection[];
  interiors: V4Shot[];
  floors: V4Shot[];
  terms: string[];
  banks: string[];
  copy: Copy;
  viewer: Viewer;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [planIndex, setPlanIndex] = useState(0);
  const [box, setBox] = useState<Box>(null);
  const c = collections[active];
  const plan = c.plans[Math.min(planIndex, c.plans.length - 1)];

  const choose = (i: number) => {
    setActive(i);
    setPlanIndex(0);
  };

  const planItems: LightboxItem[] = c.plans.map((p) => ({ id: p.id, src: p.src, alt: `${p.label} — ${p.meta}`, width: p.width, height: p.height, unoptimized: p.unoptimized, title: p.label, subtitle: p.meta }));
  const shotItems = (list: V4Shot[]): LightboxItem[] => list.map((s) => ({ id: s.id, src: s.src, alt: s.alt, width: s.width, height: s.height, title: s.title ?? s.alt }));
  const items = box?.kind === "plan" ? planItems : box?.kind === "floor" ? shotItems(floors) : shotItems(interiors);

  return (
    <section id={sectionIds.residences} aria-labelledby="v4-res-heading" data-nav-theme="light" className="bg-ivory text-ink">
      <div className="container-editorial flex flex-col gap-8 pt-[calc(var(--header-h)+2.5rem)] pb-8 md:pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <SectionLabel>{copy.label}</SectionLabel>
          <h2 id="v4-res-heading" className="title-script mt-5 text-[clamp(2.6rem,5vw,4.6rem)]">
            {copy.heading}
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-[1.7] text-ink-muted">{copy.lede}</p>
        </div>
        <div role="tablist" aria-label={copy.label} className="grid grid-cols-4 gap-1 sm:flex">
          {collections.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`v4-res-tab-${x.id}`}
              aria-selected={i === active}
              aria-controls="v4-res-panel"
              onClick={() => choose(i)}
              className={`label-caps relative min-w-0 border px-1 py-3.5 text-[0.5625rem] transition-colors sm:px-5 sm:text-[0.6875rem] ${i === active ? "border-forest bg-forest text-ivory" : "border-line-strong text-ink hover:border-forest"}`}
            >
              {x.name}
            </button>
          ))}
        </div>
      </div>

      <div id="v4-res-panel" role="tabpanel" aria-labelledby={`v4-res-tab-${c.id}`} className="grid grid-cols-[minmax(0,1fr)] lg:h-[min(88svh,58rem)] lg:grid-cols-12">
        {/* Interior photograph with the collection's facts over it */}
        <div className="relative min-h-[78svh] overflow-hidden bg-forest text-ivory lg:col-span-5 lg:min-h-0">
          <AnimatePresence initial={false}>
            <motion.div key={c.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}>
              <Image src={c.photo.src} alt={c.photo.alt} fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" style={{ objectPosition: c.photo.focus }} />
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgb(17_20_18/0.9)_0%,rgb(17_20_18/0.45)_45%,rgb(17_20_18/0)_75%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <p className="label-caps text-champagne">{c.subtitle}</p>
            <h3 className="title-script mt-2 text-[clamp(3rem,6vw,5.5rem)] leading-none">{c.name}</h3>
            <dl className="mt-5 max-w-sm">
              {c.sizes.map((s) => (
                <div key={s.rooms} className="flex items-baseline justify-between gap-6 border-b border-ivory/25 py-2 font-luxe text-lg">
                  <dt>{s.rooms}</dt>
                  <dd className="tabular-nums">{s.area}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/80">{c.body}</p>
            <p className="mt-3 text-[0.6875rem] text-ivory/50">{copy.sizesNote}</p>
          </div>
        </div>

        {/* Plan viewer */}
        <div className="flex min-h-0 flex-col bg-white p-4 md:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`label-caps px-3 py-1.5 text-[0.625rem] ${c.pending ? "bg-stone/30 text-ink" : "bg-forest text-ivory"}`}>{c.pending ? copy.plans : copy.status2026}</span>
            <span className="text-xs text-ink-muted tabular-nums">
              {Math.min(planIndex, c.plans.length - 1) + 1} / {c.plans.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setBox({ kind: "plan", index: Math.min(planIndex, c.plans.length - 1) })}
            aria-label={`${copy.openPlan}: ${plan.label} — ${plan.meta}`}
            className="group relative mt-4 block min-h-[48svh] flex-1 cursor-zoom-in lg:min-h-0"
          >
            <Image
              key={plan.id}
              src={plan.src}
              alt={`${plan.label} — ${plan.meta}`}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              unoptimized={plan.unoptimized}
              className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <span className="absolute top-0 right-0 flex size-10 items-center justify-center bg-ivory text-ink transition-colors group-hover:bg-forest group-hover:text-ivory">
              <Maximize2 className="size-4" strokeWidth={1.5} aria-hidden />
            </span>
          </button>

          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line pt-4">
            <p className="font-luxe text-xl">{plan.label}</p>
            <p className="text-sm text-ink-muted">{plan.meta}</p>
          </div>
          {c.pending ? <p className="mt-2 text-xs leading-relaxed text-ink-muted">{copy.statusPending}</p> : null}

          {c.plans.length > 1 ? (
            <ul aria-label={copy.plans} className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
              {c.plans.map((p, i) => {
                const on = i === Math.min(planIndex, c.plans.length - 1);
                return (
                  <li key={p.id} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={on}
                      aria-label={`${p.label} — ${p.meta}`}
                      onClick={() => setPlanIndex(i)}
                      className={`flex w-20 flex-col items-center gap-1 border p-1.5 transition-colors md:w-24 ${on ? "border-forest bg-ivory" : "border-line hover:border-line-strong"}`}
                    >
                      <span className="relative block aspect-[4/3] w-full">
                        <Image src={p.src} alt="" fill sizes="96px" unoptimized={p.unoptimized} className="object-contain" />
                      </span>
                      <span className={`text-[0.6875rem] tabular-nums ${on ? "text-ink" : "text-ink-muted"}`}>{p.short}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Interiors · payment terms · floor plans */}
      <div className="container-editorial grid gap-12 py-14 md:py-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="label-caps text-gold-deep">{copy.interiors}</p>
          <ul className="-mx-gutter mt-5 flex snap-x gap-2 overflow-x-auto px-gutter [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {interiors.map((s, i) => (
              <li key={s.id} className="w-[42%] shrink-0 snap-start sm:w-auto">
                <button type="button" onClick={() => setBox({ kind: "interior", index: i })} aria-label={s.alt} className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden">
                  <Image src={s.src} alt="" fill sizes="(min-width: 640px) 12vw, 42vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" style={{ objectPosition: s.focus }} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setBox({ kind: "floor", index: 0 })}
            className="label-caps mt-8 inline-flex items-center gap-3 border border-forest px-5 py-3.5 transition-colors hover:bg-forest hover:text-ivory"
          >
            <Layers className="size-4" strokeWidth={1.5} aria-hidden />
            {copy.floorsButton}
          </button>
        </div>

        <div className="lg:col-span-5">
          <p className="label-caps text-gold-deep">{copy.financingLabel}</p>
          <ol className="mt-5 border-t border-line">
            {terms.map((term, i) => (
              <li key={i} className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-line py-4">
                <span className="font-luxe text-lg text-gold-deep tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-sm leading-relaxed">{term}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-ink-muted">
            <span className="label-caps mr-2 text-[0.625rem]">{copy.partners}</span>
            {banks.join(" · ")}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">{copy.note}</p>
        </div>
      </div>

      <PlanLightbox
        items={items}
        index={box ? box.index : null}
        labels={viewer}
        onChange={(i) => {
          setBox((b) => (b ? { ...b, index: i } : b));
          if (box?.kind === "plan") setPlanIndex(i);
        }}
        onClose={() => setBox(null)}
      />
    </section>
  );
}
