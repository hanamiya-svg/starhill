/**
 * Single source of truth for project facts and contact details.
 *
 * Everything below comes from the official STAR HILL Residence brochure
 * (public/documents/star-hill-brochure.pdf). Do not add claims that are not
 * in the brochure; `null` renders as "to be confirmed" or is omitted.
 */

export type LocalizedText = { mn: string; en: string };

export const siteConfig = {
  name: "STAR HILL Residence",
  shortName: "STAR HILL",
  /** Used for canonical URLs, hreflang and Open Graph. Override with NEXT_PUBLIC_SITE_URL. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.starhills.mn",

  brochure: {
    /** Resolves to public/documents/star-hill-brochure.pdf */
    path: "/documents/star-hill-brochure.pdf",
    downloadFilename: "STAR-HILL-Residence-Brochure.pdf",
  },

  /** Official contact details (brochure back cover). */
  contact: {
    email: "starhill2027@gmail.com" as string | null,
    phone: "+976 9911 3791" as string | null,
    phoneLabel: { mn: "Борлуулалтын алба", en: "Sales office" } as LocalizedText,
    website: "www.starhills.mn" as string | null,
  },

  /** Official social accounts — none published in the brochure. */
  social: [] as { label: string; href: string }[],

  location: {
    address: {
      mn: "Хан-Уул дүүрэг, 11-р хороо, Улаанбаатар 14002, Монгол Улс",
      en: "Khan-Uul District, 11th khoroo, Ulaanbaatar 14002, Mongolia",
    } as LocalizedText | null,
    /** Landmarks shown on the brochure map, nearest first. */
    landmarks: [
      { mn: "Богд уул", en: "Bogd Uul" },
      { mn: "Зайсан толгой", en: "Zaisan Tolgoi" },
      { mn: "Зайсан Хилл", en: "Zaisan Hill" },
      { mn: "Эдийн засаг, бизнесийн сургууль", en: "Economics & Business School" },
      { mn: "Нура Монгол", en: "Nura Mongol" },
      { mn: "Туул гол", en: "Tuul River" },
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
      mn: "Дэлхийн A&D Award, Architect Master Prize-ын эзэн, 1200 гаруй архитекторуудтай олон улсын компани",
      en: "Winner of the A&D Award and the Architect Master Prize; an international practice of more than 1,200 architects",
    } as LocalizedText,
  },

  /** Residence collections exactly as presented in the brochure. */
  residences: [
    {
      id: "crystal",
      name: "Crystal",
      area: "98 m²",
      rooms: 3,
      roomRange: "2–4",
      areaRange: null as string | null,
      image: "arch-hero",
    },
    {
      id: "diamond",
      name: "Diamond",
      area: "177 m²",
      rooms: 4,
      roomRange: "3–4",
      areaRange: "118–202 m²",
      image: "res-tower-dusk",
    },
    {
      id: "penthouse",
      name: "Penthouse",
      area: "347 m²",
      rooms: 6,
      roomRange: null as string | null,
      areaRange: null as string | null,
      image: "amenity-lounge",
    },
  ] as const,
  residenceSummary: { rooms: "2–5", area: "58–205 m²" },

  /** Brands fitted throughout (brochure, "Тансаг зэрэглэл"). */
  brands: [
    "Miele",
    "Hörmann",
    "ter Hürne",
    "Marohn ThyssenKrupp",
    "Panasonic",
    "Porcelanosa",
    "Kohler",
    "LG Hausys",
  ],

  /** Financing partners named in the brochure. */
  banks: [
    { mn: "Худалдаа, хөгжлийн банк", en: "Trade and Development Bank (TDB)" },
    { mn: "Хаан банк", en: "Khan Bank" },
    { mn: "Чингис Хаан банк", en: "Chinggis Khaan Bank" },
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
