"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { ZoomViewer } from "@/components/ui/ZoomViewer";
import {
  areaRange,
  floorImageSize,
  layoutStart,
  unitMix,
  type Floor,
  type FloorId,
  type Rooms,
  type Space,
  type Unit,
  type UnitLayout,
} from "@/lib/floor-plans";
import { PlanLightbox, type LightboxItem } from "./PlanLightbox";

const EASE = [0.22, 1, 0.36, 1] as const;

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtInt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

type Lightbox = { kind: "floor" | "layout"; index: number } | null;

/**
 * Floor stack on the left (top floor first, like the building), the chosen
 * plan on the right, then the residences on that plan. Below, the furnished
 * 3D layouts. Every drawing opens in a full-screen pan/zoom viewer.
 */
export function FloorPlanExplorer({ floors, layouts }: { floors: Floor[]; layouts: UnitLayout[] }) {
  const t = useTranslations("plans");
  const reduce = useReducedMotion();
  const panelId = useId();
  const tabRefs = useRef<Partial<Record<FloorId, HTMLButtonElement | null>>>({});

  // Top-down, like a building section.
  const stack = useMemo(() => [...floors].reverse(), [floors]);
  const [floorId, setFloorId] = useState<FloorId>("f4-14");
  const [roomFilter, setRoomFilter] = useState<Rooms | null>(null);
  const [lightbox, setLightbox] = useState<Lightbox>(null);

  const floor = stack.find((f) => f.id === floorId) ?? stack[0];
  const mix = unitMix(floor.units);
  const range = areaRange(floor.units);
  const hasFilter = roomFilter !== null && mix.some((m) => m.rooms === roomFilter);
  const effectiveFilter = hasFilter ? roomFilter : null;

  const selectFloor = (id: FloorId) => {
    setFloorId(id);
    tabRefs.current[id]?.focus();
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = stack.length - 1;
    const map: Record<string, number> = {
      ArrowDown: Math.min(last, i + 1),
      ArrowRight: Math.min(last, i + 1),
      ArrowUp: Math.max(0, i - 1),
      ArrowLeft: Math.max(0, i - 1),
      Home: 0,
      End: last,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectFloor(stack[next].id);
  };

  const floorTitle = (f: Floor) => `${f.code} · ${t(`floors.${f.id}.name`)}`;

  const floorItems: LightboxItem[] = stack.map((f) => ({
    id: f.id,
    src: f.image,
    alt: t("viewer.planAlt", { floor: floorTitle(f) }),
    width: floorImageSize.width,
    height: floorImageSize.height,
    unoptimized: true,
    title: floorTitle(f),
    subtitle: t(`kinds.${f.kind}`),
  }));
  const layoutItems: LightboxItem[] = layouts.flatMap((l) =>
    l.plans.map((p) => {
      const title = p.area ? t("layouts.planTitle", { name: p.name, rooms: p.rooms, area: p.area.toFixed(1) }) : t(`layouts.items.${l.id}.title`);
      const subtitle = p.floors ? t("layouts.floors", { floors: p.floors }) : t(`layouts.items.${l.id}.level`);
      return { id: p.id, src: p.src, alt: `${title} — ${subtitle}`, width: p.width, height: p.height, title, subtitle };
    }),
  );

  const viewerLabels = {
    zoomIn: t("viewer.zoomIn"),
    zoomOut: t("viewer.zoomOut"),
    reset: t("viewer.reset"),
    fullscreen: t("viewer.fullscreen"),
    close: t("viewer.close"),
    next: t("viewer.next"),
    previous: t("viewer.previous"),
    dialog: t("viewer.dialog"),
  };

  return (
    <>
      <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-10 md:mt-24 lg:grid-cols-12 lg:gap-8">
        {/* Floor stack */}
        <div className="min-w-0 lg:col-span-3">
          <p className="label-caps text-ivory/50">{t("floorStack")}</p>
          <div
            role="tablist"
            aria-label={t("floorStack")}
            aria-orientation="vertical"
            className="-mx-gutter mt-5 flex snap-x scroll-px-[var(--gutter)] gap-2 overflow-x-auto px-gutter pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {stack.map((f, i) => {
              const selected = f.id === floor.id;
              const count = f.units.length;
              return (
                <button
                  key={f.id}
                  ref={(el) => {
                    tabRefs.current[f.id] = el;
                  }}
                  role="tab"
                  type="button"
                  id={`${panelId}-tab-${f.id}`}
                  aria-selected={selected}
                  aria-controls={`${panelId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  data-selected={selected}
                  onClick={() => setFloorId(f.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className="group relative flex shrink-0 snap-start flex-col items-start gap-0.5 border border-ivory/15 px-4 py-3 text-left transition-colors duration-300 data-[selected=true]:border-champagne data-[selected=true]:bg-ivory/[0.04] lg:w-full lg:flex-row lg:items-center lg:gap-4 lg:border-x-0 lg:border-t-0 lg:border-b-ivory/15 lg:px-0 lg:py-3.5 lg:data-[selected=true]:border-b-ivory/15 lg:data-[selected=true]:bg-transparent"
                >
                  <span
                    aria-hidden
                    className="absolute top-0 -left-px hidden h-full w-px origin-top bg-champagne transition-transform duration-500 ease-[var(--ease-out)] group-data-[selected=true]:scale-y-100 lg:block lg:scale-y-0"
                  />
                  <span className="font-luxe text-lg whitespace-nowrap tabular-nums text-ivory transition-opacity lg:w-24 lg:shrink-0 lg:pl-5 lg:text-xl lg:opacity-60 lg:group-hover:opacity-100 lg:group-data-[selected=true]:opacity-100">
                    {f.code}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs text-ivory/80 lg:text-sm lg:text-ivory/60 lg:transition-colors lg:group-hover:text-ivory lg:group-data-[selected=true]:text-ivory">
                      {t(`floors.${f.id}.name`)}
                    </span>
                    <span className="label-caps hidden text-[0.625rem] text-ivory/40 lg:block">
                      {count ? t("units", { count }) : t(`kinds.${f.kind}`)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected floor */}
        <div
          id={`${panelId}-panel`}
          role="tabpanel"
          aria-labelledby={`${panelId}-tab-${floor.id}`}
          className="min-w-0 lg:col-span-9"
        >
          <motion.div
            key={floor.id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-8"
          >
            <div>
              <p className="label-caps text-champagne">
                {t(`kinds.${floor.kind}`)}
                {floor.repeats ? <span className="text-ivory/50"> · {t("repeats", { from: floor.repeats[0], to: floor.repeats[1] })}</span> : null}
              </p>
              <h3 className="mt-3 font-luxe text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight">
                <span className="tabular-nums">{floor.code}</span>
                <span className="text-ivory/50"> — </span>
                {t(`floors.${floor.id}.name`)}
              </h3>
            </div>
            {floor.units.length && range ? (
              <p className="font-luxe text-base text-ivory/70 md:text-right md:text-lg">
                {t("units", { count: floor.units.length })}
                <span className="text-ivory/40"> · </span>
                {t("range", { min: fmt(range.min), max: fmt(range.max) })}
              </p>
            ) : null}
          </motion.div>

          <div className="mt-6 bg-white p-2 md:mt-8 md:p-3">
            <ZoomViewer
              image={floorItems[stack.indexOf(floor)]}
              resetKey={floor.id}
              labels={viewerLabels}
              onFullscreen={() => setLightbox({ kind: "floor", index: stack.indexOf(floor) })}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8">
            <p className="max-w-2xl text-[0.9375rem] leading-[1.8] text-ivory/60">{t(`floors.${floor.id}.note`)}</p>
            <p className="hidden shrink-0 text-[0.6875rem] leading-relaxed text-ivory/35 md:block md:max-w-[16rem] md:text-right">{t("viewer.hint")}</p>
          </div>

          {floor.units.length ? (
            <div className="mt-10 border-t border-ivory/15 pt-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <p className="label-caps text-ivory/50">{t("unitsOnPlan")}</p>
                <div role="group" aria-label={t("unitsOnPlan")} className="flex flex-wrap gap-2">
                  <FilterChip active={effectiveFilter === null} onClick={() => setRoomFilter(null)}>
                    {t("all")}
                    <Count>{floor.units.length}</Count>
                  </FilterChip>
                  {mix.map((m) => (
                    <FilterChip
                      key={m.rooms}
                      active={effectiveFilter === m.rooms}
                      onClick={() => setRoomFilter(effectiveFilter === m.rooms ? null : m.rooms)}
                    >
                      {t("rooms", { count: m.rooms })}
                      <Count>{m.count}</Count>
                    </FilterChip>
                  ))}
                </div>
              </div>
              <UnitGrid units={floor.units} filter={effectiveFilter} />
            </div>
          ) : (
            <div className="mt-10 border-t border-ivory/15 pt-8">
              <p className="label-caps text-ivory/50">{t("spacesOnPlan")}</p>
              <SpaceGrid spaces={floor.spaces} />
            </div>
          )}
        </div>
      </div>

      {/* 3D layouts */}
      <div className="mt-28 border-t border-ivory/15 pt-12 md:mt-36">
        <div className="grid gap-8 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <SectionLabel tone="light">{t("layouts.label")}</SectionLabel>
            <SectionHeading size="title" className="mt-8">
              {t("layouts.heading")}
            </SectionHeading>
          </div>
          <Reveal className="self-end md:col-span-4 md:col-start-9" delay={0.4}>
            <p className="text-[0.9375rem] leading-[1.8] text-ivory/60">{t("layouts.intro")}</p>
          </Reveal>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {layouts.map((l, i) => (
            <Reveal as="li" key={l.id} delay={(i % 3) * 0.1} y={16}>
              <button
                type="button"
                onClick={() => setLightbox({ kind: "layout", index: layoutStart(layouts, i) })}
                aria-label={t("layouts.open", { title: `${t(`layouts.items.${l.id}.title`)} — ${t(`layouts.items.${l.id}.level`)}` })}
                className="group block w-full text-left"
              >
                <span className="relative block aspect-square overflow-hidden bg-ivory p-6 md:p-8">
                  <span className="relative block h-full w-full">
                    <Image
                      src={l.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain transition-transform duration-[1.2s] ease-[var(--ease-out)] group-hover:scale-[1.03]"
                    />
                  </span>
                </span>
                <span className="mt-6 flex items-baseline justify-between gap-4 border-t border-ivory/15 pt-4">
                  <span className="font-luxe text-lg leading-tight">{t(`layouts.items.${l.id}.title`)}</span>
                  <span className="label-caps shrink-0 text-[0.625rem] text-champagne">{t("rooms", { count: l.rooms })}</span>
                </span>
                <span className="label-caps mt-2 block text-[0.625rem] text-ivory/45">{t(`layouts.items.${l.id}.level`)}</span>
                <span className="mt-3 block text-sm leading-relaxed text-ivory/60">{t(`layouts.items.${l.id}.detail`)}</span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>

      <PlanLightbox
        items={lightbox?.kind === "layout" ? layoutItems : floorItems}
        index={lightbox ? lightbox.index : null}
        labels={{ ...viewerLabels, hint: t("viewer.hintFull") }}
        onChange={(i) => {
          setLightbox((prev) => (prev ? { ...prev, index: i } : prev));
          if (lightbox?.kind === "floor") setFloorId(stack[i].id);
        }}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="label-caps flex h-10 items-center gap-2 border px-4 transition-colors duration-300 aria-pressed:border-champagne aria-pressed:text-champagne border-ivory/20 text-ivory/70 hover:border-ivory/50 hover:text-ivory"
    >
      {children}
    </button>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return <span className="tabular-nums opacity-60">{children}</span>;
}

function UnitGrid({ units, filter }: { units: Unit[]; filter: Rooms | null }) {
  const t = useTranslations("plans");
  return (
    <ul className="mt-6 grid grid-cols-2 gap-px bg-ivory/10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {units.map((u) => {
        const dim = filter !== null && u.rooms !== filter;
        return (
          <li
            key={u.no}
            data-dim={dim}
            className="flex flex-col gap-1 bg-obsidian p-4 transition-opacity duration-500 data-[dim=true]:opacity-25 md:p-5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="label-caps text-[0.625rem] text-ivory/50 tabular-nums">{t("unit", { no: u.no })}</span>
              <span className="label-caps text-[0.625rem] text-champagne">{t("rooms", { count: u.rooms })}</span>
            </div>
            <span className="mt-2 font-luxe text-xl tabular-nums md:text-2xl">{t("area", { value: fmt(u.area) })}</span>
            {u.duplex ? (
              <span className="mt-1 flex flex-col gap-0.5 text-[0.6875rem] leading-snug text-ivory/50">
                <span>{t("duplex", { floors: u.duplex.floors })}</span>
                <span className="tabular-nums">{t("levels", { lower: fmt(u.duplex.lower), upper: fmt(u.duplex.upper) })}</span>
                {u.duplex.terrace ? <span className="tabular-nums">{t("terrace", { value: fmt(u.duplex.terrace) })}</span> : null}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function SpaceGrid({ spaces }: { spaces: Space[] }) {
  const t = useTranslations("plans");
  return (
    <ul className="mt-6 grid grid-cols-2 gap-px bg-ivory/10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {spaces.map((s, i) => (
        <li key={`${s.key}-${i}`} className="flex flex-col gap-1 bg-obsidian p-4 md:p-5">
          <span className="label-caps text-[0.625rem] text-ivory/50">{t(`spaces.${s.key}`)}</span>
          <span className="mt-2 font-luxe text-xl tabular-nums md:text-2xl">
            {s.area !== undefined ? t("area", { value: fmtInt(s.area) }) : s.count !== undefined ? s.count : <span className="text-ivory/30">—</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
