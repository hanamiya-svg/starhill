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

export type PlanCollection = "crystal" | "diamond" | "duplex" | "penthouse";

/**
 * Latest residence plan sheets (2026), `public/images/plans/Artboard N@4x.png`.
 * Each sheet prints its collection, room count, area and floors; the web copies
 * in `public/plans/units-2026/` are crops of the plan area (the originals stay
 * untouched): `abNN.webp` = unit plan + key plan + compass, `abNN-unit.webp` =
 * unit plan only, `abNN-sheet.jpg` = the whole sheet, downsized.
 */
export type UnitPlan = {
  id: string;
  /** Artboard number of the original sheet. */
  sheet: number;
  collection: PlanCollection;
  rooms: Rooms;
  area: number;
  floors: string;
  image: string;
  unitImage: string;
  sheetImage: string;
  original: string;
  width: number;
  height: number;
};

const sheet = (n: number, collection: PlanCollection, rooms: Rooms, area: number): UnitPlan => {
  const id = `ab${String(n).padStart(2, "0")}`;
  return {
    id,
    sheet: n,
    collection,
    rooms,
    area,
    floors: "4–14",
    image: `/plans/units-2026/${id}.webp`,
    unitImage: `/plans/units-2026/${id}-unit.webp`,
    sheetImage: `/plans/units-2026/${id}-sheet.jpg`,
    original: `/images/plans/Artboard ${n}@4x.png`,
    width: 1698,
    height: 1260,
  };
};

/** Sorted by collection, then rooms, then area — the order every gallery uses. */
export const unitPlans: UnitPlan[] = [
  sheet(5, "crystal", 2, 59.0),
  sheet(6, "crystal", 2, 63.0),
  sheet(10, "crystal", 2, 68.0),
  sheet(11, "crystal", 2, 68.0),
  sheet(7, "crystal", 2, 70.5),
  sheet(8, "crystal", 2, 70.5),
  sheet(9, "crystal", 2, 70.5),
  sheet(12, "crystal", 2, 70.5),
  sheet(16, "crystal", 2, 70.5),
  sheet(18, "crystal", 2, 70.5),
  sheet(3, "diamond", 3, 95.5),
  sheet(14, "diamond", 3, 101.0),
  sheet(13, "diamond", 3, 102.5),
  sheet(15, "diamond", 3, 106.0),
  sheet(17, "diamond", 3, 109.0),
  sheet(4, "diamond", 3, 112.5),
  sheet(1, "diamond", 4, 126.0),
  sheet(2, "diamond", 4, 143.0),
];

export type LayoutId = "crystal-2" | "diamond-3" | "diamond-4" | "duplex" | "penthouse-lower" | "penthouse-upper";

export type LayoutPlan = { id: string; src: string; width: number; height: number; name: string; rooms: Rooms; area?: number; floors?: string };

export type UnitLayout = { id: LayoutId; image: string; width: number; height: number; rooms: Rooms; plans: LayoutPlan[] };

const asLayoutPlan = (u: UnitPlan): LayoutPlan => ({
  id: u.id,
  src: u.image,
  width: u.width,
  height: u.height,
  name: u.collection === "crystal" ? "Crystal" : "Diamond",
  rooms: u.rooms,
  area: u.area,
  floors: u.floors,
});

const group = (id: LayoutId, plans: UnitPlan[]): UnitLayout => ({
  id,
  image: plans[0].image,
  width: plans[0].width,
  height: plans[0].height,
  rooms: plans[0].rooms,
  plans: plans.map(asLayoutPlan),
});

/**
 * Residence plans, grouped for the galleries. Crystal and Diamond use the 2026
 * sheets; no updated sheets exist yet for Duplex or Penthouse, so those keep the
 * furnished 3D plans from the architect's set (`public/plans/units/`).
 */
export const unitLayouts: UnitLayout[] = [
  group("crystal-2", unitPlans.filter((u) => u.collection === "crystal")),
  group("diamond-3", unitPlans.filter((u) => u.collection === "diamond" && u.rooms === 3)),
  group("diamond-4", unitPlans.filter((u) => u.collection === "diamond" && u.rooms === 4)),
  {
    id: "duplex",
    image: "/plans/units/unit-6.webp",
    width: 1800,
    height: 1787,
    rooms: 3,
    plans: [{ id: "duplex", src: "/plans/units/unit-6.webp", width: 1800, height: 1787, name: "Duplex", rooms: 3 }],
  },
  {
    id: "penthouse-lower",
    image: "/plans/units/unit-1.webp",
    width: 1800,
    height: 1856,
    rooms: 5,
    plans: [{ id: "penthouse-lower", src: "/plans/units/unit-1.webp", width: 1800, height: 1856, name: "Penthouse", rooms: 5 }],
  },
  {
    id: "penthouse-upper",
    image: "/plans/units/unit-2.webp",
    width: 1800,
    height: 1674,
    rooms: 5,
    plans: [{ id: "penthouse-upper", src: "/plans/units/unit-2.webp", width: 1800, height: 1674, name: "Penthouse", rooms: 5 }],
  },
];

/** Index of each group's first plan in the flattened list (what the lightbox steps through). */
export const layoutStart = (layouts: UnitLayout[], index: number) => layouts.slice(0, index).reduce((n, l) => n + l.plans.length, 0);

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
