/**
 * Media registry. Drop the supplied architectural photographs into
 * `public/images/...` using these base names; any of .jpg/.jpeg/.webp/.avif/.png
 * is picked up automatically. Until a file exists, a labelled architectural
 * placeholder is rendered instead — nothing is faked.
 *
 * Alt text lives in messages/{mn,en}.json under `media.<key>`.
 */

export type PlaceholderArt =
  | "skyline"
  | "aerial"
  | "facade"
  | "sculptural"
  | "evening"
  | "hills"
  | "grounds"
  | "street"
  | "detail";

export const mediaRegistry = {
  // `focus` is the CSS object-position used when a layout crops the image,
  // chosen so the architecture (or the people in it) stays in frame.
  "arch-hero": { file: "/images/architecture/hero", art: "skyline", focus: "45% 50%" },
  "arch-aerial": { file: "/images/architecture/aerial", art: "aerial", focus: "50% 50%" },
  "arch-facade": { file: "/images/architecture/glass-facade", art: "facade", focus: "66% 45%" },
  "arch-sculptural": { file: "/images/architecture/sculptural-forms", art: "sculptural", focus: "68% 45%" },
  "arch-evening": { file: "/images/architecture/evening-light", art: "evening", focus: "62% 50%" },
  "land-hills": { file: "/images/landscape/green-hills", art: "hills", focus: "42% 60%" },
  "land-grounds": { file: "/images/landscape/landscaped-grounds", art: "grounds", focus: "55% 55%" },
  "land-street": { file: "/images/landscape/pedestrian-street", art: "street", focus: "22% 60%" },
  "land-public": { file: "/images/landscape/public-space", art: "grounds", focus: "58% 55%" },
  "detail-reflection": { file: "/images/details/glass-reflection", art: "detail", focus: "50% 45%" },
  // From the official brochure
  "arch-aerial-pool": { file: "/images/architecture/aerial-pool", art: "aerial", focus: "50% 55%" },
  "arch-hillside": { file: "/images/architecture/hillside-evening", art: "evening", focus: "40% 50%" },
  "arch-curved": { file: "/images/architecture/curved-facade", art: "facade", focus: "50% 40%" },
  "arch-night": { file: "/images/architecture/night-pavilion", art: "evening", focus: "50% 55%" },
  "amenity-sports": { file: "/images/amenities/sports-complex", art: "facade", focus: "60% 50%" },
  "amenity-playground": { file: "/images/amenities/roof-garden-playground", art: "grounds", focus: "50% 40%" },
  "amenity-lounge": { file: "/images/amenities/lounge-interior", art: "detail", focus: "50% 50%" },
  "land-garden": { file: "/images/landscape/flower-garden", art: "hills", focus: "50% 50%" },
  "res-tower-dusk": { file: "/images/residences/tower-dusk", art: "evening", focus: "50% 40%" },
  "location-map": { file: "/images/location/map", art: "aerial", focus: "50% 50%" },
} as const satisfies Record<string, { file: string; art: PlaceholderArt; focus: string }>;

export type MediaKey = keyof typeof mediaRegistry;

export type ResolvedMedia = {
  key: MediaKey;
  /** Public URL of the real asset, or null when it has not been supplied yet. */
  src: string | null;
  /** Expected location (shown on placeholders in development). */
  expected: string;
  art: PlaceholderArt;
  /** CSS object-position for cropped layouts. */
  focus: string;
};
