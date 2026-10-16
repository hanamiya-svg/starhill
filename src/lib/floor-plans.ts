/**
 * Floor plans — transcribed from the architect's drawings
 * ("STAR HILL – A B C блок план зураг", sheets B1–F17, dated 2026.05.05).
 *
 * The drawings themselves are cropped renders of those sheets in
 * `public/plans/floors/`. Only the drawing area is kept; title blocks,
 * grid dimensions and legends are cut away. Names and notes for each floor
 * live in messages → plans.floors.<id>.
 */

export type Rooms = 2 | 3 | 4 | 5;

export type Unit = {
  no: number;
  rooms: Rooms;
  /** Total area in m² (for two-level residences, both levels plus any terrace allowance). */
  area: number;
  /** Two-level residences: the area on each level and the floors they span. */
  duplex?: { lower: number; upper: number; terrace?: number; floors: string };
};

export type SpaceKey = "parking" | "technical" | "fitness" | "golf" | "sales" | "changing" | "retail";

export type Space = { key: SpaceKey; area?: number; count?: number };

export type FloorKind = "parking" | "services" | "residential" | "penthouse";

export type FloorId = "b1" | "f1" | "f2" | "f3" | "f4-14" | "f15" | "f16" | "f17";

export type Floor = {
  id: FloorId;
  /** Short level code as printed on the drawings. */
  code: string;
  kind: FloorKind;
  /** Public path of the cropped drawing. */
  image: string;
  /** Storey range when one plan repeats (F4–F14). */
  repeats?: [from: number, to: number];
  units: Unit[];
  spaces: Space[];
};

/** All floor drawings share one crop, so the viewer never changes shape between floors. */
export const floorImageSize = { width: 3217, height: 1705 } as const;

const u = (no: number, rooms: Rooms, area: number, duplex?: Unit["duplex"]): Unit =>
  duplex ? { no, rooms, area, duplex } : { no, rooms, area };

/** Bottom to top. The explorer lists them top-down, like the building itself. */
export const floors: Floor[] = [
  {
    id: "b1",
    code: "B1",
    kind: "parking",
    image: "/plans/floors/b1.png",
    units: [],
    spaces: [{ key: "parking", count: 41 }, { key: "technical" }],
  },
  {
    id: "f1",
    code: "F1",
    kind: "services",
    image: "/plans/floors/f1.png",
    units: [],
    spaces: [
      { key: "fitness", area: 200 },
      { key: "golf", area: 65 },
      { key: "sales", area: 150 },
      { key: "changing" },
      { key: "retail", area: 240 },
      { key: "retail", area: 220 },
      { key: "retail", area: 170 },
      { key: "retail", area: 155 },
      { key: "retail", area: 105 },
      { key: "retail", area: 105 },
    ],
  },
  {
    id: "f2",
    code: "F2",
    kind: "residential",
    image: "/plans/floors/f2.png",
    spaces: [],
    units: [
      u(1, 3, 111.0),
      u(2, 4, 142.3),
      u(3, 3, 94.2),
      u(4, 2, 71.0),
      u(5, 2, 69.3),
      u(6, 2, 67.0),
      u(7, 2, 58.0),
      u(8, 3, 107.6),
      u(9, 3, 99.3),
      u(10, 3, 104.8),
      u(11, 2, 61.7),
      u(12, 2, 67.0),
      u(13, 2, 69.3),
      u(14, 2, 69.3),
      u(15, 2, 70.0),
      u(16, 2, 64.0),
      u(17, 2, 63.0),
      u(18, 3, 99.3),
    ],
  },
  {
    id: "f3",
    code: "F3",
    kind: "residential",
    image: "/plans/floors/f3.png",
    spaces: [],
    units: [
      u(1, 3, 108.2),
      u(2, 4, 131.7),
      u(3, 3, 91.8),
      u(4, 2, 67.0),
      u(5, 2, 66.0),
      u(6, 2, 66.0),
      u(7, 2, 65.2),
      u(8, 2, 56.6),
      u(9, 3, 98.5),
      u(10, 3, 95.8),
      u(11, 3, 95.7),
      u(12, 2, 58.8),
      u(13, 2, 65.2),
      u(14, 2, 66.0),
      u(15, 2, 66.0),
      u(16, 2, 67.0),
      u(17, 2, 65.0),
      u(18, 2, 60.3),
      u(19, 3, 114.4),
    ],
  },
  {
    id: "f4-14",
    code: "F4–F14",
    kind: "residential",
    image: "/plans/floors/f4-14.png",
    repeats: [4, 14],
    spaces: [],
    units: [
      u(1, 3, 111.2),
      u(2, 4, 141.6),
      u(3, 3, 94.2),
      u(4, 2, 69.3),
      u(5, 2, 69.3),
      u(6, 2, 69.3),
      u(7, 2, 67.0),
      u(8, 2, 58.0),
      u(9, 3, 107.5),
      u(10, 3, 99.8),
      u(11, 3, 105.0),
      u(12, 2, 61.7),
      u(13, 2, 67.0),
      u(14, 2, 69.3),
      u(15, 2, 69.3),
      u(16, 2, 69.3),
      u(17, 3, 101.2),
      u(18, 4, 125.0),
    ],
  },
  {
    id: "f15",
    code: "F15",
    kind: "residential",
    image: "/plans/floors/f15.png",
    spaces: [],
    units: [
      u(1, 4, 177.5, { lower: 91.0, upper: 86.5, floors: "F15–F16" }),
      u(2, 5, 204.6, { lower: 119.0, upper: 85.6, floors: "F15–F16" }),
      u(3, 3, 109.7, { lower: 52.0, upper: 57.7, floors: "F15–F16" }),
      u(4, 2, 66.5),
      u(5, 2, 69.3),
      u(6, 2, 69.3),
      u(7, 2, 69.3),
      u(8, 2, 67.0),
      u(9, 2, 58.0),
      u(10, 3, 107.5),
      u(11, 3, 99.8),
      u(12, 3, 105.0),
      u(13, 2, 61.7),
      u(14, 2, 67.0),
      u(15, 2, 69.3),
      u(16, 2, 69.3),
      u(17, 2, 69.3),
      u(18, 2, 66.5),
      u(19, 3, 109.7, { lower: 52.0, upper: 57.7, floors: "F15–F16" }),
      u(20, 5, 203.6, { lower: 118.6, upper: 85.0, floors: "F15–F16" }),
    ],
  },
  {
    id: "f16",
    code: "F16",
    kind: "penthouse",
    image: "/plans/floors/f16.png",
    spaces: [],
    units: [
      u(1, 4, 177.5, { lower: 91.0, upper: 86.5, floors: "F15–F16" }),
      u(2, 5, 204.6, { lower: 119.0, upper: 85.6, floors: "F15–F16" }),
      u(3, 3, 109.7, { lower: 52.0, upper: 57.7, floors: "F15–F16" }),
      u(4, 3, 117.8, { lower: 67.2, upper: 39.8, terrace: 10.8, floors: "F16–F17" }),
      u(5, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(6, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(7, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(8, 4, 148.0, { lower: 70.6, upper: 77.4, floors: "F16–F17" }),
      u(9, 4, 110.0, { lower: 53.0, upper: 57.0, floors: "F16–F17" }),
      u(10, 5, 211.2, { lower: 119.0, upper: 92.2, floors: "F16–F17" }),
      u(11, 4, 178.0, { lower: 89.0, upper: 89.0, floors: "F16–F17" }),
      u(12, 5, 212.7, { lower: 120.0, upper: 92.7, floors: "F16–F17" }),
      u(13, 4, 110.0, { lower: 53.0, upper: 57.0, floors: "F16–F17" }),
      u(14, 4, 148.0, { lower: 70.6, upper: 77.4, floors: "F16–F17" }),
      u(15, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(16, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(17, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(18, 3, 117.8, { lower: 67.2, upper: 39.8, terrace: 10.8, floors: "F16–F17" }),
      u(19, 3, 109.7, { lower: 52.0, upper: 57.7, floors: "F15–F16" }),
      u(20, 5, 203.6, { lower: 118.6, upper: 85.0, floors: "F15–F16" }),
    ],
  },
  {
    id: "f17",
    code: "F17",
    kind: "penthouse",
    image: "/plans/floors/f17.png",
    spaces: [],
    units: [
      u(4, 3, 117.8, { lower: 67.2, upper: 39.8, terrace: 10.8, floors: "F16–F17" }),
      u(5, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(6, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(7, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(8, 4, 148.0, { lower: 70.6, upper: 77.4, floors: "F16–F17" }),
      u(9, 4, 110.0, { lower: 53.0, upper: 57.0, floors: "F16–F17" }),
      u(10, 5, 211.2, { lower: 119.0, upper: 92.2, floors: "F16–F17" }),
      u(11, 4, 178.0, { lower: 89.0, upper: 89.0, floors: "F16–F17" }),
      u(12, 5, 212.7, { lower: 120.0, upper: 92.7, floors: "F16–F17" }),
      u(13, 4, 110.0, { lower: 53.0, upper: 57.0, floors: "F16–F17" }),
      u(14, 4, 148.0, { lower: 70.6, upper: 77.4, floors: "F16–F17" }),
      u(15, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(16, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(17, 3, 120.4, { lower: 69.4, upper: 39.4, terrace: 11.6, floors: "F16–F17" }),
      u(18, 3, 117.8, { lower: 67.2, upper: 39.8, terrace: 10.8, floors: "F16–F17" }),
    ],
  },
];

export type LayoutId =
  | "duplex-lower"
  | "duplex-upper"
  | "four-room"
  | "three-room-corner"
  | "three-room"
  | "terrace-duplex";

export type UnitLayout = { id: LayoutId; image: string; width: number; height: number; rooms: Rooms };

/**
 * Furnished 3D plans of typical residence types (`public/plans/units/`),
 * sliced from the supplied render strip. Titles live in messages → plans.layouts.items.
 */
export const unitLayouts: UnitLayout[] = [
  { id: "duplex-lower", image: "/plans/units/unit-1.webp", width: 1800, height: 1856, rooms: 5 },
  { id: "duplex-upper", image: "/plans/units/unit-2.webp", width: 1800, height: 1674, rooms: 5 },
  { id: "four-room", image: "/plans/units/unit-3.webp", width: 1800, height: 1838, rooms: 4 },
  { id: "three-room-corner", image: "/plans/units/unit-4.webp", width: 1800, height: 1937, rooms: 3 },
  { id: "three-room", image: "/plans/units/unit-5.webp", width: 1653, height: 2153, rooms: 3 },
  { id: "terrace-duplex", image: "/plans/units/unit-6.webp", width: 1800, height: 1787, rooms: 3 },
];

/** Count of residences per room type, in ascending order. */
export function unitMix(units: Unit[]): { rooms: Rooms; count: number }[] {
  const counts = new Map<Rooms, number>();
  for (const unit of units) counts.set(unit.rooms, (counts.get(unit.rooms) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([rooms, count]) => ({ rooms, count }));
}

export function areaRange(units: Unit[]): { min: number; max: number } | null {
  if (!units.length) return null;
  const areas = units.map((unit) => unit.area);
  return { min: Math.min(...areas), max: Math.max(...areas) };
}
