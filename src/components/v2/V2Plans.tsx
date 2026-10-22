"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { PlanLightbox, type LightboxItem } from "@/components/sections/PlanLightbox";
import { ZoomViewer } from "@/components/ui/ZoomViewer";
import { areaRange, floorImageSize, floors, layoutStart, unitLayouts, unitMix, type FloorId, type Rooms } from "@/lib/floor-plans";
import { sectionIds } from "@/lib/navigation";
import { V2Head } from "./ui";

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Elevator panel → drawing → unit table, then a contact sheet of 3D layouts. */
export function V2Plans({ index }: { index: string }) {
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
  const layoutItems: LightboxItem[] = unitLayouts.flatMap((l) =>
    l.plans.map((p) => {
      const title = p.area ? t("layouts.planTitle", { name: p.name, rooms: p.rooms, area: p.area.toFixed(1) }) : t(`layouts.items.${l.id}.title`);
      const subtitle = p.floors ? t("layouts.floors", { floors: p.floors }) : t(`layouts.items.${l.id}.level`);
      return { id: p.id, src: p.src, alt: `${title} — ${subtitle}`, width: p.width, height: p.height, title, subtitle };
    }),
  );
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
    <section id={sectionIds.plans} aria-labelledby="v2-plans" className="bg-paper pb-section">
      <div className="container-editorial">
        <V2Head numeral={index} label={t("label")} title={t("heading")} id="v2-plans" intro={t("intro")} />

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12">
          {/* Lobby directory */}
          <div role="tablist" aria-label={t("floorStack")} aria-orientation="vertical" className="lg:col-span-4">
            <p className="v2-label mb-4">{t("floorStack")}</p>
            {stack.map((f) => {
              const on = f.id === floor.id;
              return (
                <button
                  key={f.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setFloorId(f.id)}
                  className="group flex w-full items-baseline gap-3 border-b border-rule py-3.5 text-left"
                >
                  <span className={`w-16 shrink-0 font-luxe text-lg whitespace-nowrap transition-colors ${on ? "text-accent" : "text-fg/55 group-hover:text-fg"}`}>{f.code}</span>
                  <span className={`min-w-0 flex-1 truncate text-sm font-light transition-colors ${on ? "text-fg" : "text-fg/50 group-hover:text-fg/80"}`}>
                    {t(`floors.${f.id}.name`)}
                  </span>
                  <span className={`shrink-0 text-[0.6875rem] tabular-nums ${on ? "text-accent" : "text-fg/35"}`}>{f.units.length || "—"}</span>
                </button>
              );
            })}
          </div>

          <div className="min-w-0 lg:col-span-8">
            <div className="v2-frame">
              <div className="bg-ivory p-2 md:p-3">
                <ZoomViewer image={floorItems[fi]} resetKey={floor.id} labels={labels} onFullscreen={() => setBox({ kind: "floor", index: fi })} />
              </div>
            </div>
            <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="v2-label">
                  {t(`kinds.${floor.kind}`)}
                  {floor.repeats ? ` · ${t("repeats", { from: floor.repeats[0], to: floor.repeats[1] })}` : ""}
                </p>
                <h3 className="mt-3 font-luxe text-3xl font-light">
                  {floor.code} <span className="text-accent italic">—</span> {t(`floors.${floor.id}.name`)}
                </h3>
                <p className="mt-2 max-w-lg text-sm font-light text-muted">{t(`floors.${floor.id}.note`)}</p>
              </div>
              {range ? <p className="shrink-0 font-luxe text-lg font-light text-fg/70">{t("range", { min: fmt(range.min), max: fmt(range.max) })}</p> : null}
            </div>

            {floor.units.length ? (
              <>
                <div role="group" aria-label={t("unitsOnPlan")} className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-b border-rule pb-4">
                  {[null, ...mix.map((m) => m.rooms)].map((r) => {
                    const on = filter === r;
                    return (
                      <button
                        key={r ?? "all"}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setRooms(r)}
                        className={`border-b pb-1 text-[0.6875rem] tracking-[0.24em] uppercase transition-colors ${on ? "border-accent text-accent" : "border-transparent text-fg/50 hover:text-fg"}`}
                      >
                        {r === null ? t("all") : t("rooms", { count: r })}
                      </button>
                    );
                  })}
                </div>
                <ul className="grid grid-cols-2 gap-x-8 sm:grid-cols-3">
                  {floor.units.map((u) => (
                    <li
                      key={u.no}
                      className={`flex items-baseline justify-between gap-3 border-b border-rule py-3 transition-opacity duration-500 ${filter !== null && u.rooms !== filter ? "opacity-20" : ""}`}
                    >
                      <span className="text-[0.6875rem] text-fg/45 tabular-nums">
                        {t("unit", { no: u.no })} · {t("rooms", { count: u.rooms })}
                      </span>
                      <span className="font-luxe text-lg font-light tabular-nums">{fmt(u.area)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <ul className="mt-8 grid grid-cols-2 gap-x-8 sm:grid-cols-3">
                {floor.spaces.map((s, i) => (
                  <li key={`${s.key}-${i}`} className="flex items-baseline justify-between gap-3 border-b border-rule py-3 text-sm font-light">
                    <span className="text-fg/70">{t(`spaces.${s.key}`)}</span>
                    <span className="font-luxe text-lg">{s.area !== undefined ? s.area : (s.count ?? "—")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Interior layouts */}
        <div className="mt-24 md:mt-32">
          <V2Head numeral="—" label={t("layouts.label")} title={t("layouts.heading")} intro={t("layouts.intro")} align="center" />
          <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:mt-20 lg:grid-cols-3 lg:gap-x-10">
            {unitLayouts.map((l, i) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => setBox({ kind: "layout", index: layoutStart(unitLayouts, i) })}
                  aria-label={t("layouts.open", { title: `${t(`layouts.items.${l.id}.title`)} — ${t(`layouts.items.${l.id}.level`)}` })}
                  className="group block w-full text-left"
                >
                  <span className="relative block aspect-square bg-ivory p-4 md:p-6">
                    <span className="relative block h-full w-full">
                      <Image src={l.image} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-contain transition-transform duration-700 group-hover:scale-[1.04]" />
                    </span>
                  </span>
                  <span className="mt-5 block font-luxe text-xl leading-snug font-light transition-colors group-hover:text-accent">{t(`layouts.items.${l.id}.title`)}</span>
                  <span className="v2-label mt-2 block !text-fg/45">{t(`layouts.items.${l.id}.level`)}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-center text-xs font-light text-fg/40">{t("source")}</p>
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
