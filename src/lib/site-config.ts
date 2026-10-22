/**
 * Single source of truth for project facts and contact details.
 *
 * Everything below comes from the official STAR HILL Residence brochure
 * (2026 edition, source-media/brochure-2026). Do not add claims that are not
 * in the brochure; `null` renders as "to be confirmed" or is omitted.
 */

export type LocalizedText = { mn: string; en: string };

export const siteConfig = {
  name: "STAR HILL Residence",
  shortName: "STAR HILL",
  /** Used for canonical URLs, hreflang and Open Graph. Override with NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.starhills.mn",

  brochure: {
    /** The 2026 brochure as uploaded: public/documents/last version - Star HIl.pdf */
    path: "/documents/last%20version%20-%20Star%20HIl.pdf",
    downloadFilename: "STAR-HILL-Residence-Brochure.pdf",
  },

  /** Official contact details (brochure back cover). */
  contact: {
    email: "starhill2027@gmail.com" as string | null,
    phone: "+976 9911 3791" as string | null,
    phoneLabel: { mn: "Борлуулалтын алба", en: "Sales office" } as LocalizedText,
    website: "www.starhill.mn" as string | null,
    /** Sales office (2026 brochure back cover). */
    office: { mn: "Minister Tower, 4 давхар", en: "Minister Tower, 4th floor" } as LocalizedText,
  },

  /** Official social accounts — none published in the brochure. */
  social: [] as { label: string; href: string }[],

  location: {
    address: {
      mn: "Хан-Уул дүүрэг, 11-р хороо, Богд уулын зүүн бэлд, Улаанбаатар 14002",
      en: "Khan-Uul District, 11th khoroo, eastern foothills of Bogd Mountain, Ulaanbaatar 14002",
    } as LocalizedText | null,
    /** Landmarks shown on the brochure map, as on the 2026 brochure map. */
    landmarks: [
      { mn: "Богд уул", en: "Bogd Mountain" },
      { mn: "Америк сургууль", en: "American School of Ulaanbaatar" },
      { mn: "Зайсан толгой", en: "Zaisan Monument" },
      { mn: "Белла Виста", en: "Bella Vista" },
      { mn: "Туул гол", en: "Tuul River" },
      { mn: "ХААИС", en: "Mongolian University of Life Sciences" },
    ] as LocalizedText[],
    /** The brochure ships its own map graphic; no coordinates are published, so no embed. */
    mapEmbedUrl: null as string | null,
    /** Address search (not a pin — the exact coordinates are not published). */
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("Khan-Uul District, 11th khoroo, Ulaanbaatar 14002, Mongolia"),
  },

  architect: {
    name: "Aedas",
    facts: {
      mn: "2002 онд Кейт Гриффитс үүсгэн байгуулсан, 10 гаруй улсад 1500 гаруй архитектортой; A&D Awards 2025 — Оны шилдэг архитектурын компани",
      en: "Founded by Keith Griffiths in 2002; 1,500+ architects in over ten countries; A&D Awards 2025 Architecture Firm of the Year",
    } as LocalizedText,
  },

  /** Residence collections as in the latest project information (2026): Duplex sits within Diamond. */
  residences: [
    {
      id: "crystal",
      name: "Crystal",
      /** Latest floor plan, shown on the back of the card. Penthouse has no 2026 sheet yet, so it keeps the brochure plan. */
      plan: { src: "/plans/units-2026/ab05-unit.webp", width: 1198, height: 1260 },
      sizes: [
        { rooms: 2, area: "56.6–69.3 m²" },
        { rooms: 3, area: "91.8–114.4 m²" },
      ],
      /** The residence drawn on the plan (2026 sheet, Artboard 5). */
      example: "59.0 m²",
      image: "int-living-media",
    },
    {
      id: "diamond",
      name: "Diamond",
      plan: { src: "/plans/units-2026/ab01-unit.webp", width: 1198, height: 1260 },
      sizes: [
        { rooms: 3, area: "117.8–120 m²" },
        { rooms: 4, area: "125–148 m²" },
      ],
      example: "126.0 m²",
      image: "int-living-island",
    },
    {
      id: "penthouse",
      name: "Penthouse",
      plan: { src: "/plans/collections/penthouse.png", width: 646, height: 1300 },
      sizes: [
        { rooms: 3, area: "109.7 m²" },
        { rooms: 4, area: "110–178 m²" },
        { rooms: 5, area: "203.6–212.7 m²" },
      ],
      example: "203.6 m²",
      image: "int-penthouse",
    },
  ] as const,
  residenceSummary: { rooms: "2–5", area: "56.6–212.7 m²" },

  /** More interior photography, shown as a strip under the collections. */
  interiors: ["int-duplex", "int-kitchen", "int-dining", "int-bedroom", "int-kids"] as const,

  /** Brands fitted throughout (2026 brochure, "Тансаг зэрэглэл"), with country of origin. */
  brands: [
    { name: "Reynaers", origin: { mn: "Бельги", en: "Belgium" } },
    { name: "Hörmann", origin: { mn: "Герман", en: "Germany" } },
    { name: "Tempini", origin: { mn: "Итали", en: "Italy" } },
    { name: "ter Hürne", origin: { mn: "Герман", en: "Germany" } },
    { name: "Kohler", origin: { mn: "АНУ", en: "USA" } },
    { name: "Danfoss", origin: { mn: "Дани", en: "Denmark" } },
    { name: "Hyundai", origin: { mn: "БНСУ", en: "Korea" } },
    { name: "SOLID", origin: { mn: "БНСУ", en: "Korea" } },
  ] as { name: string; origin: LocalizedText }[],

  /** Financing partners named in the brochure. */
  banks: [
    { mn: "Хаан банк", en: "Khan Bank" },
    { mn: "Худалдаа, хөгжлийн банк", en: "Trade and Development Bank (TDB)" },
    { mn: "Голомт банк", en: "Golomt Bank" },
  ] as LocalizedText[],

  /** Fields shown in the overview table, in order. Values live in messages → overview.values. */
  overviewOrder: [
    "developer",
    "architect",
    "location",
    "residences",
    "collections",
    "amenities",
    "brands",
    "financing",
  ] as const,
} as const;

export type ProjectField = (typeof siteConfig.overviewOrder)[number];
export type ResidenceId = (typeof siteConfig.residences)[number]["id"];
