import { getLocale, getTranslations } from "next-intl/server";
import { floorImageSize, floors, unitPlans, type PlanCollection } from "@/lib/floor-plans";
import type { MediaKey } from "@/lib/media-registry";
import { siteConfig } from "@/lib/site-config";
import { photoProps } from "./Photo";
import { V4ResidencesView, type V4Collection, type V4Plan, type V4Shot } from "./V4ResidencesView";

/** Pixel sizes of the interior photographs (for the zoom viewer's aspect ratio). */
const INTERIOR_SIZE: Partial<Record<MediaKey, [number, number]>> = {
  "int-living-media": [1600, 891],
  "int-living-island": [1600, 1065],
  "int-duplex": [1600, 1421],
  "int-penthouse": [1600, 885],
  "int-penthouse-view": [1436, 918],
  "int-kitchen": [1600, 1063],
  "int-dining": [1600, 1058],
  "int-bedroom": [1600, 1080],
  "int-kids": [1600, 1066],
};

/**
 * Sizes per collection as printed in the 2026 brochure (pages 12–15), which is
 * the source that names all four collections. Crystal and Diamond plans are the
 * 2026 sheets; Duplex and Penthouse have no 2026 sheet yet.
 */
const COLLECTIONS: { id: PlanCollection; name: string; photo: MediaKey; sizes: { rooms: number; area: string }[] }[] = [
  { id: "crystal", name: "Crystal", photo: "int-living-media", sizes: [{ rooms: 2, area: "56.6–71.8 m²" }, { rooms: 3, area: "91.8–101.2 m²" }] },
  { id: "diamond", name: "Diamond", photo: "int-living-island", sizes: [{ rooms: 3, area: "95.7–114.4 m²" }, { rooms: 4, area: "125–142.3 m²" }] },
  { id: "duplex", name: "Duplex", photo: "int-duplex", sizes: [{ rooms: 3, area: "109.7–120.4 m²" }, { rooms: 4, area: "110–148 m²" }] },
  { id: "penthouse", name: "Penthouse", photo: "int-penthouse", sizes: [{ rooms: 4, area: "177.5–178 m²" }, { rooms: 5, area: "203.5–212 m²" }] },
];

export async function V4Residences() {
  const t = await getTranslations("v4.residences");
  const tr = await getTranslations("residences");
  const tp = await getTranslations("plans");
  const tm = await getTranslations("media");
  const locale = (await getLocale()) as "mn" | "en";

  const sheetPlans = (id: PlanCollection, name: string): V4Plan[] =>
    unitPlans
      .filter((u) => u.collection === id)
      .map((u) => ({
        id: u.id,
        src: u.image,
        width: u.width,
        height: u.height,
        label: `${name} · ${u.area.toFixed(1)} m²`,
        meta: t("planMeta", { rooms: u.rooms, area: u.area.toFixed(1), floors: u.floors }),
        short: `${u.area.toFixed(1)}`,
      }));

  const extraPlans: Record<"duplex" | "penthouse", V4Plan[]> = {
    duplex: [
      { id: "duplex-brochure", src: "/plans/collections/duplex.png", width: 1200, height: 1083, label: "Duplex", meta: t("brochurePlan"), short: "1", unoptimized: true },
      { id: "duplex-3d", src: "/plans/units/unit-6.webp", width: 1800, height: 1787, label: "Duplex", meta: t("plan3dDuplex"), short: "3D" },
    ],
    penthouse: [
      { id: "penthouse-brochure", src: "/plans/collections/penthouse.png", width: 646, height: 1300, label: "Penthouse", meta: t("brochurePlanPenthouse"), short: "1", unoptimized: true },
      { id: "penthouse-3d-lower", src: "/plans/units/unit-1.webp", width: 1800, height: 1856, label: "Penthouse", meta: t("plan3dLower"), short: "3D·1" },
      { id: "penthouse-3d-upper", src: "/plans/units/unit-2.webp", width: 1800, height: 1674, label: "Penthouse", meta: t("plan3dUpper"), short: "3D·2" },
    ],
  };

  const collections: V4Collection[] = COLLECTIONS.map((c) => {
    const pending = c.id === "duplex" || c.id === "penthouse";
    return {
      id: c.id,
      name: c.name,
      subtitle: t(`collections.${c.id}.subtitle`),
      body: t(`collections.${c.id}.body`),
      photo: { ...photoProps(c.photo), alt: tm(c.photo) },
      sizes: c.sizes.map((s) => ({ rooms: tr("rooms", { count: s.rooms }), area: s.area })),
      pending,
      plans: pending ? extraPlans[c.id as "duplex" | "penthouse"] : sheetPlans(c.id, c.name),
    };
  });

  const interiors: V4Shot[] = siteConfig.interiors.map((k) => {
    const [width, height] = INTERIOR_SIZE[k] ?? [1600, 1066];
    return { id: k, ...photoProps(k), alt: tm(k), width, height };
  });

  const floorShots: V4Shot[] = floors.map((f) => ({
    id: f.id,
    src: f.image,
    focus: "50% 50%",
    alt: tp("viewer.planAlt", { floor: `${f.code} · ${tp(`floors.${f.id}.name`)}` }),
    width: floorImageSize.width,
    height: floorImageSize.height,
    title: `${f.code} · ${tp(`floors.${f.id}.name`)}`,
  }));

  return (
    <V4ResidencesView
      collections={collections}
      interiors={interiors}
      floors={floorShots}
      terms={tr.raw("financing.terms") as string[]}
      banks={siteConfig.banks.map((b) => b[locale])}
      copy={{
        label: t("label"),
        heading: t("heading"),
        lede: t("lede"),
        plans: t("plans"),
        openPlan: t("openPlan"),
        status2026: t("status2026"),
        statusPending: t("statusPending"),
        sizesNote: t("sizesNote"),
        floorsButton: t("floorsButton"),
        interiors: t("interiors"),
        financingLabel: t("financingLabel"),
        partners: tr("financing.partners"),
        note: tr("financing.note"),
      }}
      viewer={{
        zoomIn: tp("viewer.zoomIn"),
        zoomOut: tp("viewer.zoomOut"),
        reset: tp("viewer.reset"),
        fullscreen: tp("viewer.fullscreen"),
        close: tp("viewer.close"),
        next: tp("viewer.next"),
        previous: tp("viewer.previous"),
        dialog: tp("viewer.dialog"),
        hint: tp("viewer.hintFull"),
      }}
    />
  );
}
