import { getLocale, getTranslations } from "next-intl/server";
import type { MediaKey } from "@/lib/media-registry";
import { siteConfig } from "@/lib/site-config";
import { photoProps } from "./Photo";
import { V4AdvantagesView, type V4Advantage, type V4Landmark } from "./V4AdvantagesView";

const ITEMS: { key: V4Advantage["key"]; image: MediaKey }[] = [
  { key: "location", image: "arch-street-tower" },
  { key: "glass", image: "arch-tower-day" },
  { key: "green", image: "land-garden" },
  { key: "bogd", image: "land-hills" },
  { key: "ev", image: "land-street-walk" },
];

/**
 * Pin centres on the brochure map (`public/images/location/map.jpg`, 1372 × 1717),
 * read off the 2026 brochure (page 17) — positions on that graphic, not survey data.
 */
const PINS: { name: { mn: string; en: string }; x: number; y: number }[] = [
  { name: { mn: "Богд уул", en: "Bogd Mountain" }, x: 34.7, y: 86.0 },
  { name: { mn: "Америк сургууль", en: "American School of Ulaanbaatar" }, x: 47.7, y: 48.1 },
  { name: { mn: "Зайсан толгой", en: "Zaisan Monument" }, x: 42.1, y: 30.9 },
  { name: { mn: "Белла Виста", en: "Bella Vista" }, x: 29.2, y: 22.5 },
  { name: { mn: "Туул гол", en: "Tuul River" }, x: 90.7, y: 24.5 },
  { name: { mn: "ХААИС", en: "Mongolian University of Life Sciences" }, x: 8.7, y: 34.1 },
];

export async function V4Advantages() {
  const t = await getTranslations("v4.advantages");
  const tm = await getTranslations("media");
  const tl = await getTranslations("location");
  const locale = (await getLocale()) as "mn" | "en";

  const items: V4Advantage[] = ITEMS.map(({ key, image }) => ({
    key,
    title: t(`items.${key}.title`),
    body: t(`items.${key}.body`),
    photo: { ...photoProps(image), alt: tm(image) },
  }));
  const landmarks: V4Landmark[] = PINS.map((p) => ({ name: p.name[locale], x: p.x, y: p.y }));

  return (
    <V4AdvantagesView
      items={items}
      landmarks={landmarks}
      map={{ src: photoProps("location-map").src, alt: tl("mapTitle"), width: 1372, height: 1717 }}
      address={siteConfig.location.address?.[locale] ?? ""}
      mapLink={siteConfig.location.mapLink}
      copy={{
        label: t("label"),
        heading: t("heading"),
        mapLabel: t("mapLabel"),
        mapNote: t("mapNote"),
        landmarksLabel: t("landmarksLabel"),
        starHill: t("starHill"),
        addressLabel: tl("addressLabel"),
        openMap: tl("openMap"),
      }}
    />
  );
}
