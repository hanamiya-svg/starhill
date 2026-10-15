import { useId, type ReactNode } from "react";
import type { PlaceholderArt } from "@/lib/media-registry";

/**
 * Abstract, clearly-labelled stand-in for architectural photography that has
 * not been supplied yet. It is deterministic (seeded), so server and client
 * renders always match.
 */

type Palette = {
  skyTop: string;
  skyBottom: string;
  hillFar: string;
  hillMid: string;
  hillNear: string;
  glassTop: string;
  glassBottom: string;
  slab: string;
  lit: string;
  litOpacity: number;
  tree: string;
  treeDark: string;
};

const DAY: Palette = {
  skyTop: "#9db6c6",
  skyBottom: "#e8ebe4",
  hillFar: "#aab5a3",
  hillMid: "#7f8c7b",
  hillNear: "#56664f",
  glassTop: "#6c8ba0",
  glassBottom: "#c4d4dc",
  slab: "#f5f3ed",
  lit: "#e6cf9f",
  litOpacity: 0.55,
  tree: "#6f7f63",
  treeDark: "#46573f",
};

const DUSK: Palette = {
  skyTop: "#16212a",
  skyBottom: "#b9a888",
  hillFar: "#38463f",
  hillMid: "#26342d",
  hillNear: "#18251f",
  glassTop: "#22323c",
  glassBottom: "#56707e",
  slab: "#c5b69a",
  lit: "#f0cf8e",
  litOpacity: 0.9,
  tree: "#24332a",
  treeDark: "#18251f",
};

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Volume = { dx: number; w: number; h: number };

function SteppedBuilding({
  x,
  base,
  volumes,
  p,
  glass,
  rand,
  floor = 26,
  litChance = 0.08,
}: {
  x: number;
  base: number;
  volumes: Volume[];
  p: Palette;
  glass: string;
  rand: () => number;
  floor?: number;
  litChance?: number;
}) {
  // Local, position-seeded RNG: render-order independent, so SSR and client always match.
  void rand;
  const r = rng(Math.round(x * 7 + base * 13 + volumes.length * 101));
  const parts: ReactNode[] = [];
  let y = base;
  volumes.forEach((v, vi) => {
    const top = y - v.h;
    const left = x + v.dx;
    const floors = Math.max(1, Math.floor(v.h / floor));
    const bays = Math.max(2, Math.floor(v.w / 22));
    parts.push(
      <rect key={`v${vi}`} x={left} y={top} width={v.w} height={v.h} fill={`url(#${glass})`} />,
    );
    parts.push(
      <rect key={`g${vi}`} x={left} y={top} width={v.w} height={v.h} fill={`url(#${glass}-grid)`} />,
    );
    for (let f = 0; f < floors; f++) {
      for (let b = 0; b < bays; b++) {
        if (r() < litChance) {
          parts.push(
            <rect
              key={`l${vi}-${f}-${b}`}
              x={left + (b * v.w) / bays + 2}
              y={top + f * floor + 3}
              width={v.w / bays - 4}
              height={floor - 6}
              fill={p.lit}
              opacity={p.litOpacity}
            />,
          );
        }
      }
    }
    // Thin slab edge that gives the "layered" look of the references.
    parts.push(
      <rect key={`s${vi}`} x={left - 6} y={top - 5} width={v.w + 12} height={5} fill={p.slab} />,
    );
    y = top;
  });
  return <g>{parts}</g>;
}

function Trees({
  xs,
  base,
  size,
  p,
  rand,
}: {
  xs: number[];
  base: number;
  size: number;
  p: Palette;
  rand: () => number;
}) {
  void rand;
  const r = rng(Math.round(xs[0] * 3 + base * 17 + xs.length));
  return (
    <g>
      {xs.map((x, i) => {
        const s = size * (0.75 + r() * 0.5);
        return (
          <g key={i}>
            <rect x={x - s * 0.04} y={base - s * 0.9} width={s * 0.08} height={s * 0.9} fill={p.treeDark} />
            <ellipse cx={x} cy={base - s * 1.05} rx={s * 0.42} ry={s * 0.5} fill={p.tree} />
            <ellipse cx={x + s * 0.2} cy={base - s * 0.85} rx={s * 0.3} ry={s * 0.34} fill={p.treeDark} opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
}

function hillPath(points: [number, number][], bottom = 1000) {
  const [first, ...rest] = points;
  let d = `M0 ${bottom} L${first[0]} ${first[1]}`;
  for (let i = 0; i < rest.length; i++) {
    const prev = i === 0 ? first : rest[i - 1];
    const cur = rest[i];
    const cx = (prev[0] + cur[0]) / 2;
    d += ` C${cx} ${prev[1]} ${cx} ${cur[1]} ${cur[0]} ${cur[1]}`;
  }
  return `${d} L1600 ${bottom} Z`;
}

function Skyline({ p, glass, rand, horizon = 640, base = 770, scale = 1 }: {
  p: Palette;
  glass: string;
  rand: () => number;
  horizon?: number;
  base?: number;
  scale?: number;
}) {
  const s = scale;
  const buildings: { x: number; volumes: Volume[] }[] = [
    { x: 150, volumes: [{ dx: 0, w: 180, h: 150 }, { dx: 20, w: 140, h: 90 }] },
    { x: 360, volumes: [{ dx: 0, w: 210, h: 220 }, { dx: -18, w: 200, h: 120 }, { dx: 30, w: 130, h: 90 }] },
    { x: 620, volumes: [{ dx: 0, w: 230, h: 260 }, { dx: 26, w: 190, h: 140 }, { dx: -14, w: 170, h: 110 }] },
    { x: 900, volumes: [{ dx: 0, w: 200, h: 200 }, { dx: 30, w: 160, h: 150 }] },
    { x: 1140, volumes: [{ dx: 0, w: 190, h: 170 }, { dx: -20, w: 170, h: 100 }] },
    { x: 1360, volumes: [{ dx: 0, w: 150, h: 120 }] },
  ];
  return (
    <g>
      <path d={hillPath([[0, horizon - 40], [380, horizon - 110], [820, horizon - 60], [1240, horizon - 130], [1600, horizon - 70]])} fill={p.hillFar} />
      <path d={hillPath([[0, horizon + 40], [520, horizon - 10], [1100, horizon + 30], [1600, horizon - 20]])} fill={p.hillMid} />
      <g transform={`translate(${800 * (1 - s)} ${base * (1 - s)}) scale(${s})`}>
        {buildings.map((b, i) => (
          <SteppedBuilding key={i} x={b.x} base={base} volumes={b.volumes} p={p} glass={glass} rand={rand} />
        ))}
      </g>
      <rect x={0} y={base} width={1600} height={1000 - base} fill={p.hillNear} />
      <Trees xs={[60, 130, 330, 590, 870, 1110, 1330, 1520]} base={base + 14} size={70 * s} p={p} rand={rand} />
    </g>
  );
}

export function ArchitecturalPlaceholder({
  art,
  className,
  label,
  title,
  labelClassName = "bottom-3 left-3",
}: {
  art: PlaceholderArt;
  className?: string;
  /** Positioning classes for the corner label. */
  labelClassName?: string;
  /** Small caption shown in the corner, e.g. "Image pending". */
  label?: string;
  /** Accessible description of the intended image. */
  title?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const sky = `sky${id}`;
  const glass = `glass${id}`;
  const sheen = `sheen${id}`;
  const p = art === "evening" ? DUSK : DAY;
  const rand = rng(art.length * 977 + art.charCodeAt(0));

  let scene: ReactNode;
  switch (art) {
    case "aerial":
      scene = (
        <g>
          <path d={hillPath([[0, 300], [400, 250], [900, 320], [1300, 260], [1600, 300]])} fill={p.hillFar} />
          <path d={hillPath([[0, 420], [500, 380], [1000, 450], [1600, 400]])} fill={p.hillMid} />
          <path d={hillPath([[0, 600], [700, 560], [1600, 620]])} fill={p.hillNear} />
          <path d="M-20 900 C 400 760, 900 820, 1640 640" stroke={p.slab} strokeOpacity={0.45} strokeWidth={10} fill="none" />
          <g transform="translate(330 120) scale(0.6)">
            <Skyline p={p} glass={glass} rand={rand} horizon={720} base={770} />
          </g>
          <Trees xs={[120, 260, 1240, 1390, 1500]} base={860} size={60} p={p} rand={rand} />
        </g>
      );
      break;
    case "hills":
      scene = (
        <g>
          <path d={hillPath([[0, 470], [300, 380], [700, 450], [1100, 360], [1600, 440]])} fill={p.hillFar} />
          <path d={hillPath([[0, 600], [450, 520], [900, 590], [1350, 500], [1600, 560]])} fill={p.hillMid} />
          <g transform="translate(560 330) scale(0.32)">
            {[0, 260, 520].map((x, i) => (
              <SteppedBuilding key={i} x={x} base={780} volumes={[{ dx: 0, w: 200, h: 220 - i * 30 }, { dx: 24, w: 150, h: 120 }]} p={p} glass={glass} rand={rand} />
            ))}
          </g>
          <path d={hillPath([[0, 760], [600, 690], [1200, 750], [1600, 700]])} fill={p.hillNear} />
          <Trees xs={[80, 200, 1300, 1450, 1560]} base={780} size={90} p={p} rand={rand} />
        </g>
      );
      break;
    case "grounds":
      scene = (
        <g>
          <path d={hillPath([[0, 470], [500, 400], [1000, 450], [1600, 410]])} fill={p.hillFar} />
          <g transform="translate(240 160) scale(0.7)">
            {[0, 300, 640, 960].map((x, i) => (
              <SteppedBuilding key={i} x={x} base={620} volumes={[{ dx: 0, w: 240, h: 200 + (i % 2) * 60 }, { dx: 30, w: 180, h: 110 }]} p={p} glass={glass} rand={rand} />
            ))}
          </g>
          <rect x={0} y={590} width={1600} height={410} fill={p.hillMid} />
          <path d="M780 1000 C 760 860, 840 760, 980 600" stroke={p.slab} strokeOpacity={0.6} strokeWidth={46} fill="none" />
          <path d="M0 760 C 400 700, 1200 720, 1600 680 L1600 1000 L0 1000Z" fill={p.hillNear} opacity={0.5} />
          <Trees xs={[90, 230, 380, 560, 1080, 1240, 1400, 1530]} base={760} size={130} p={p} rand={rand} />
          <Trees xs={[140, 470, 1180, 1480]} base={960} size={190} p={p} rand={rand} />
        </g>
      );
      break;
    case "street": {
      const vx = 800;
      const vy = 520;
      const mullions = Array.from({ length: 9 }, (_, i) => i / 9);
      scene = (
        <g>
          <path d={`M0 0 L620 300 L620 ${vy + 120} L0 1000Z`} fill={`url(#${glass})`} />
          <path d={`M1600 0 L980 300 L980 ${vy + 120} L1600 1000Z`} fill={`url(#${glass})`} />
          {mullions.map((t, i) => (
            <g key={i} stroke={p.slab} strokeOpacity={0.35} strokeWidth={2}>
              <line x1={620 * t} y1={300 * t} x2={620 * t} y2={1000 - (1000 - (vy + 120)) * t} />
              <line x1={1600 - 620 * t} y1={300 * t} x2={1600 - 620 * t} y2={1000 - (1000 - (vy + 120)) * t} />
            </g>
          ))}
          {[0.2, 0.45, 0.7].map((t, i) => (
            <g key={i} stroke={p.slab} strokeWidth={6}>
              <line x1={0} y1={1000 * t} x2={620} y2={300 + (vy + 120 - 300) * t} />
              <line x1={1600} y1={1000 * t} x2={980} y2={300 + (vy + 120 - 300) * t} />
            </g>
          ))}
          <path d={`M520 1000 L${vx - 40} ${vy + 120} L${vx + 40} ${vy + 120} L1080 1000Z`} fill={p.slab} opacity={0.85} />
          <path d={`M0 1000 L620 ${vy + 120} L${vx - 40} ${vy + 120} L520 1000Z`} fill={p.hillMid} />
          <path d={`M1600 1000 L980 ${vy + 120} L${vx + 40} ${vy + 120} L1080 1000Z`} fill={p.hillMid} />
          <Trees xs={[660, 940]} base={vy + 130} size={60} p={p} rand={rand} />
          <Trees xs={[560, 1040]} base={vy + 220} size={110} p={p} rand={rand} />
          <Trees xs={[360, 1240]} base={vy + 420} size={220} p={p} rand={rand} />
        </g>
      );
      break;
    }
    case "facade":
    case "detail": {
      const cols = art === "detail" ? 6 : 12;
      const rows = art === "detail" ? 5 : 9;
      const w = 1900 / cols;
      const h = 1300 / rows;
      const cells: ReactNode[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rand() < (art === "detail" ? 0.04 : 0.07)) {
            cells.push(
              <rect key={`${r}-${c}`} x={c * w + 6} y={r * h + 6} width={w - 12} height={h - 12} fill={p.lit} opacity={0.45} />,
            );
          }
        }
      }
      scene = (
        <g transform={art === "detail" ? "rotate(-14 800 500) translate(-150 -150)" : "translate(-150 -150)"}>
          <rect x={0} y={0} width={1900} height={1300} fill={`url(#${glass})`} />
          {cells}
          <polygon points="200,1300 900,0 1250,0 550,1300" fill={`url(#${sheen})`} />
          {Array.from({ length: cols + 1 }, (_, c) => (
            <line key={`c${c}`} x1={c * w} x2={c * w} y1={0} y2={1300} stroke={p.slab} strokeOpacity={0.5} strokeWidth={art === "detail" ? 10 : 4} />
          ))}
          {Array.from({ length: rows + 1 }, (_, r) => (
            <rect key={`r${r}`} x={0} y={r * h - (r % 3 === 0 ? 7 : 2)} width={1900} height={r % 3 === 0 ? 14 : 4} fill={p.slab} opacity={r % 3 === 0 ? 0.95 : 0.45} />
          ))}
        </g>
      );
      break;
    }
    case "sculptural":
      scene = (
        <g>
          <path d={hillPath([[0, 660], [400, 600], [900, 650], [1600, 590]])} fill={p.hillFar} />
          <SteppedBuilding
            x={330}
            base={820}
            floor={34}
            volumes={[
              { dx: 0, w: 420, h: 170 },
              { dx: -60, w: 440, h: 136 },
              { dx: 70, w: 360, h: 136 },
              { dx: -20, w: 300, h: 102 },
            ]}
            p={p}
            glass={glass}
            rand={rand}
          />
          <SteppedBuilding
            x={900}
            base={820}
            floor={34}
            volumes={[
              { dx: 0, w: 380, h: 136 },
              { dx: 50, w: 340, h: 136 },
              { dx: -40, w: 320, h: 102 },
            ]}
            p={p}
            glass={glass}
            rand={rand}
          />
          <rect x={0} y={820} width={1600} height={180} fill={p.hillNear} />
          <Trees xs={[110, 240, 820, 1380, 1510]} base={836} size={110} p={p} rand={rand} />
        </g>
      );
      break;
    case "evening":
    case "skyline":
    default:
      scene = <Skyline p={p} glass={glass} rand={rand} />;
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
      >
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.skyTop} />
            <stop offset="1" stopColor={p.skyBottom} />
          </linearGradient>
          <linearGradient id={glass} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor={p.glassTop} />
            <stop offset="1" stopColor={p.glassBottom} />
          </linearGradient>
          {/* Floor/mullion grid as a pattern: one element per volume instead of dozens of lines. */}
          <pattern id={`${glass}-grid`} width="22" height="26" patternUnits="userSpaceOnUse">
            <path d="M0 0H22M0 0V26" fill="none" stroke={p.slab} strokeOpacity="0.28" strokeWidth="1.2" />
          </pattern>
          <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill={`url(#${sky})`} />
        {scene}
      </svg>
      {label ? (
        <span className={`label-caps pointer-events-none absolute z-[1] ${labelClassName} bg-ivory/85 px-2 py-1 text-[0.5625rem] tracking-[0.18em] text-ink-muted`}>
          {label}
        </span>
      ) : null}
    </div>
  );
}
