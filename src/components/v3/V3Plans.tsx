"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { PlanLightbox, type LightboxItem } from "@/components/sections/PlanLightbox";
import { ZoomViewer } from "@/components/ui/ZoomViewer";
import { areaRange, floorImageSize, floors, unitLayouts, unitMix, type FloorId, type Rooms } from "@/lib/floor-plans";
import { sectionIds } from "@/lib/navigation";
import { V3Head } from "./ui";

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Stepped like the terraced building: narrower towards the top. */
const WIDTH: Record<FloorId, string> = {
  f17: "64%",
  f16: "76%",
  f15: "86%",
  "f4-14": "94%",
  f3: "94%",
  f2: "94%",
  f1: "100%",
  b1: "100%",
};

/** Building silhouette picker → rounded viewer → unit cards; then a rail of 3D layouts. */
export function V3Plans() {
  const t = useTranslations("plans");
  const stack = useMemo(() => [...floors].reverse(), []);
  const [floorId, setFloorId] = useState<FloorId>("f4-14");
  const [rooms, setRooms] = useState<Rooms | null>(null);
  const [box, setBox] = useState<{ kind: "floor" | "layout"; index: number } | null>(null);

  const floor = stack.find((f) => f.id === floorId)!;
  const fi = stack.indexOf(floor);
  const mix = unitMix(floor.units);
  const range = areaRange(floor.units);
  const filter = rooms !== null && mix.some((m) => m.rooms === rooms) ? rooms : null;
  const title = (id: FloorId, code: string) => `${code} · ${t(`floors.${id}.name`)}`;

  const floorItems: LightboxItem[] = stack.map((f) => ({
    id: f.id,
    src: f.image,
    alt: t("viewer.planAlt", { floor: title(f.id, f.code) }),
    width: floorImageSize.width,
    height: floorImageSize.height,
    unoptimized: true,
    title: title(f.id, f.code),
    subtitle: t(`kinds.${f.kind}`),
  }));
  const layoutItems: LightboxItem[] = unitLayouts.map((l) => ({
    id: l.id,
    src: l.image,
    alt: `${t(`layouts.items.${l.id}.title`)} — ${t(`layouts.items.${l.id}.level`)}`,
    width: l.width,
    height: l.height,
    title: t(`layouts.items.${l.id}.title`),
    subtitle: t(`layouts.items.${l.id}.level`),
  }));
  const labels = {
    zoomIn: t("viewer.zoomIn"),
    zoomOut: t("viewer.zoomOut"),
    reset: t("viewer.reset"),
    fullscreen: t("viewer.fullscreen"),
    close: t("viewer.close"),
    next: t("viewer.next"),
    previous: t("viewer.previous"),
    dialog: t("viewer.dialog"),
    hint: t("viewer.hintFull"),
  };

  return (
    <section id={sectionIds.plans} aria-labelledby="v3-plans" className="bg-paper pb-section">
      <div className="container-editorial">
        <V3Head label={t("label")} title={t("heading")} id="v3-plans" intro={t("intro")} />

        <div className="mt-10 grid gap-3 rounded-[2.25rem] bg-card p-3 md:mt-14 md:p-4 lg:grid-cols-12 lg:gap-4">
          {/* Building */}
          <div role="tablist" aria-label={t("floorStack")} aria-orientation="vertical" className="flex flex-col items-center gap-1.5 rounded-[1.75rem] bg-paper p-4 lg:sticky lg:top-24 lg:col-span-3 lg:self-start lg:py-8">
            {stack.map((f) => {
              const on = f.id === floor.id;
              return (
                <button
                  key={f.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setFloorId(f.id)}
                  style={{ width: WIDTH[f.id] }}
                  className={`flex items-center justify-between gap-2 rounded-full px-4 transition-colors ${f.id === "f4-14" ? "py-4" : "py-2"} ${
 on ? "bg-accent text-accent-ink" : f.id === "b1" ? "bg-fg/10 hover:bg-fg/20" : "bg-card hover:bg-soft"
 }`}
                >
                  <span className="font-mono text-xs whitespace-nowrap">{f.code}</span>
                  <span className={`truncate text-[0.6875rem] ${on ? "text-accent-ink/70" : "text-fg/50"}`}>
                    {f.units.length ? t("units", { count: f.units.length }) : t(`kinds.${f.kind}`)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Drawing + details */}
          <div className="min-w-0 lg:col-span-9">
            <div className="overflow-hidden rounded-[1.75rem] bg-white p-2 md:p-3">
              <ZoomViewer image={floorItems[fi]} resetKey={floor.id} labels={labels} onFullscreen={() => setBox({ kind: "floor", index: fi })} />
            </div>
            <div className="mt-4 flex flex-col gap-4 px-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-luxe text-2xl">
                  {floor.code} <span className="text-fg/40">·</span> {t(`floors.${floor.id}.name`)}
                </h3>
                <p className="mt-1 max-w-lg text-sm text-fg/60">{t(`floors.${floor.id}.note`)}</p>
              </div>
              {range ? (
                <p className="shrink-0 rounded-full bg-paper px-4 py-2 text-sm">{t("range", { min: fmt(range.min), max: fmt(range.max) })}</p>
              ) : null}
            </div>

            {floor.units.length ? (
              <>
                <div role="group" aria-label={t("unitsOnPlan")} className="mt-5 flex flex-wrap gap-2 px-2">
                  {[null, ...mix.map((m) => m.rooms)].map((r) => {
                    const on = filter === r;
                    const count = r === null ? floor.units.length : mix.find((m) => m.rooms === r)!.count;
                    return (
                      <button
                        key={r ?? "all"}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setRooms(r)}
                        className={`rounded-full px-4 py-2 text-sm transition-colors ${on ? "bg-fg text-paper" : "bg-paper hover:bg-soft"}`}
                      >
                        {r === null ? t("all") : t("rooms", { count: r })} <span className="opacity-50">{count}</span>
                      </button>
                    );
                  })}
                </div>
                <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {floor.units.map((u) => (
                    <li
                      key={u.no}
                      className={`rounded-[1.1rem] bg-paper p-4 transition-opacity duration-500 ${filter !== null && u.rooms !== filter ? "opacity-25" : ""}`}
                    >
                      <div className="flex items-center justify-between text-xs text-fg/55">
                        <span>{t("unit", { no: u.no })}</span>
                        <span className="rounded-full bg-card px-2 py-0.5">{t("rooms", { count: u.rooms })}</span>
                      </div>
                      <p className="mt-2 font-luxe text-2xl tabular-nums">{t("area", { value: fmt(u.area) })}</p>
                      {u.duplex ? <p className="mt-1 text-[0.6875rem] text-accent">{t("duplex", { floors: u.duplex.floors })}</p> : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <ul className="mt-5 flex flex-wrap gap-2 px-2">
                {floor.spaces.map((s, i) => (
                  <li key={`${s.key}-${i}`} className="rounded-full bg-paper px-4 py-2 text-sm">
                    {t(`spaces.${s.key}`)}
                    {s.area !== undefined ? <span className="text-fg/50"> · {t("area", { value: s.area })}</span> : s.count ? <span className="text-fg/50"> · {s.count}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Layout rail */}
        <div className="mt-16 md:mt-24">
          <V3Head label={t("layouts.label")} title={t("layouts.heading")} intro={t("layouts.intro")} />
          <ul className="-mx-gutter mt-10 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {unitLayouts.map((l, i) => (
              <li key={l.id} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[30%]">
                <button
                  type="button"
                  onClick={() => setBox({ kind: "layout", index: i })}
                  aria-label={t("layouts.open", { title: `${t(`layouts.items.${l.id}.title`)} — ${t(`layouts.items.${l.id}.level`)}` })}
                  className="group block w-full rounded-[1.75rem] bg-card p-3 text-left"
                >
                  <span className="relative block aspect-square overflow-hidden rounded-[1.25rem] bg-white p-4">
                    <span className="relative block h-full w-full">
                      <Image src={l.image} alt="" fill sizes="(min-width: 1024px) 30vw, 72vw" className="object-contain transition-transform duration-700 group-hover:scale-[1.04]" />
                    </span>
                  </span>
                  <span className="block px-2 pt-4 pb-1">
                    <span className="block font-luxe text-lg leading-snug">{t(`layouts.items.${l.id}.title`)}</span>
                    <span className="mt-1 block text-xs text-fg/55">
                      {t(`layouts.items.${l.id}.level`)} · {t("rooms", { count: l.rooms })}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-fg/45">{t("source")}</p>
        </div>
      </div>

      <PlanLightbox
        items={box?.kind === "layout" ? layoutItems : floorItems}
        index={box ? box.index : null}
        labels={labels}
        onChange={(i) => {
          setBox((b) => (b ? { ...b, index: i } : b));
          if (box?.kind === "floor") setFloorId(stack[i].id);
        }}
        onClose={() => setBox(null)}
      />
    </section>
  );
}
