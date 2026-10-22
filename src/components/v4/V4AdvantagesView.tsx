"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { sectionIds } from "./navigation";

export type V4Advantage = { key: "location" | "glass" | "green" | "bogd" | "ev"; title: string; body: string; photo: { src: string; focus: string; alt: string } };
export type V4Landmark = { name: string; x: number; y: number };

const EASE = [0.22, 1, 0.36, 1] as const;
/** Where the Star Hill pin sits on the brochure map (percent of the graphic). */
const HOME = { x: 71.6, y: 46.4 };

export function V4AdvantagesView({
  items,
  landmarks,
  map,
  address,
  mapLink,
  copy,
}: {
  items: V4Advantage[];
  landmarks: V4Landmark[];
  map: { src: string; alt: string; width: number; height: number };
  address: string;
  mapLink: string | null;
  copy: Record<"label" | "heading" | "mapLabel" | "mapNote" | "landmarksLabel" | "starHill" | "addressLabel" | "openMap", string>;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const a = items[active];

  // Landmarks light up one after another while the map is on screen; a click pins one.
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInView = useInView(mapRef, { amount: 0.4 });
  const [mark, setMark] = useState(0);
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    if (!mapInView || pinned || reduce) return;
    const id = window.setInterval(() => setMark((m) => (m + 1) % landmarks.length), 2600);
    return () => window.clearInterval(id);
  }, [mapInView, pinned, reduce, landmarks.length]);

  return (
    <section id={sectionIds.advantages} aria-labelledby="v4-adv-heading" data-nav-theme="dark" className="bg-obsidian text-ivory">
      {/* Five advantages beside one large photograph */}
      <div className="grid grid-cols-[minmax(0,1fr)] lg:min-h-[100svh] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-gutter pt-[calc(var(--header-h)+2.5rem)] pb-10 lg:col-span-5 lg:px-12 lg:pb-16 xl:px-16">
          <SectionLabel tone="light">{copy.label}</SectionLabel>
          <h2 id="v4-adv-heading" className="title-script mt-5 text-[clamp(2.6rem,5vw,4.6rem)]">
            {copy.heading}
          </h2>
          <ol className="mt-10 border-t border-ivory/15">
            {items.map((it, i) => {
              const on = i === active;
              return (
                <li key={it.key} className="border-b border-ivory/15">
                  <button type="button" aria-expanded={on} onClick={() => setActive(i)} className="flex w-full items-baseline gap-5 py-4 text-left">
                    <span className={`font-luxe text-sm tabular-nums ${on ? "text-champagne" : "text-ivory/40"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={`font-luxe text-[clamp(1.3rem,1.9vw,1.75rem)] leading-tight transition-colors ${on ? "text-ivory" : "text-ivory/55 hover:text-ivory/85"}`}>{it.title}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on ? (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.45, ease: EASE }} className="overflow-hidden">
                        <p className="pb-5 pl-10 text-[0.9375rem] leading-[1.75] text-ivory/75">{it.body}</p>
                        {/* Phones: the photograph sits under its own text */}
                        <div className="relative mb-5 aspect-[4/3] overflow-hidden lg:hidden">
                          <Image src={it.photo.src} alt={it.photo.alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: it.photo.focus }} />
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="relative hidden overflow-hidden lg:col-span-7 lg:block">
          <AnimatePresence initial={false}>
            <motion.div key={a.key} className="absolute inset-0" initial={{ opacity: 0, scale: reduce ? 1 : 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}>
              <Image src={a.photo.src} alt={a.photo.alt} fill sizes="58vw" className="object-cover" style={{ objectPosition: a.photo.focus }} />
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="absolute inset-y-0 left-0 w-1/4 bg-[linear-gradient(90deg,rgb(17_20_18/0.6),transparent)]" />
        </div>
      </div>

      {/* Location: the brochure map, landmarks highlighted in turn */}
      <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-12">
        <div ref={mapRef} className="relative bg-[#e4ddd3] lg:col-span-7">
          <div className="relative mx-auto aspect-[1372/1717] w-full max-w-[44rem]">
            <Image src={map.src} alt={map.alt} fill sizes="(min-width: 1024px) 44rem, 100vw" className="object-contain" />
            {/* Star Hill */}
            <span aria-hidden className="absolute aspect-square w-[31%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-champagne" style={{ left: `${HOME.x}%`, top: `${HOME.y}%` }}>
              <span className="absolute inset-0 animate-ping rounded-full border border-champagne/70 motion-reduce:animate-none" />
            </span>
            {landmarks.map((l, i) => (
              <span
                key={l.name}
                aria-hidden
                className={`absolute aspect-square w-[10.5%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] transition-all duration-500 ${i === mark ? "scale-100 border-forest opacity-100 shadow-[0_0_0_8px_rgb(24_37_31/0.18)]" : "scale-75 border-transparent opacity-0"}`}
                style={{ left: `${l.x}%`, top: `${l.y}%` }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center px-gutter py-14 lg:col-span-5 lg:px-12 xl:px-16">
          <p className="label-caps text-champagne">{copy.mapLabel}</p>
          <p className="mt-4 font-luxe text-2xl leading-snug">{copy.starHill}</p>
          <p className="label-caps mt-6 text-ivory/50">{copy.addressLabel}</p>
          <address className="mt-2 text-[0.9375rem] leading-relaxed text-ivory/85 not-italic">{address}</address>
          <p className="label-caps mt-8 text-ivory/50">{copy.landmarksLabel}</p>
          <ol className="mt-3">
            {landmarks.map((l, i) => (
              <li key={l.name}>
                <button
                  type="button"
                  aria-pressed={i === mark}
                  onClick={() => {
                    setMark(i);
                    setPinned(true);
                  }}
                  className={`flex w-full items-baseline gap-4 border-b border-ivory/10 py-2.5 text-left transition-colors ${i === mark ? "text-ivory" : "text-ivory/55 hover:text-ivory/80"}`}
                >
                  <span className={`font-luxe text-sm tabular-nums ${i === mark ? "text-champagne" : ""}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{l.name}</span>
                </button>
              </li>
            ))}
          </ol>
          {mapLink ? (
            <a href={mapLink} target="_blank" rel="noopener noreferrer" className="label-caps mt-8 inline-flex items-center gap-2 self-start border border-ivory/40 px-5 py-3 transition-colors hover:bg-ivory/10">
              {copy.openMap}
              <ArrowUpRight className="size-3.5" strokeWidth={1.25} />
            </a>
          ) : null}
          <p className="mt-8 text-xs leading-relaxed text-ivory/45">{copy.mapNote}</p>
        </div>
      </div>
    </section>
  );
}
