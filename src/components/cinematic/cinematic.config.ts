import type { MediaKey } from "@/lib/media-registry";

/**
 * Cinematic timeline configuration — the single place to tune pacing.
 *
 * All positions are normalised scroll progress through the pinned intro
 * (0 = top of the film, 1 = the moment the page releases). The same progress
 * value drives the video's currentTime, the scene copy, and the fallback
 * image camera, so they can never drift apart.
 *
 * Copy for each scene lives in messages/{mn,en}.json → cinematic.scenes.<id>.
 */

export type SceneId = "arrival" | "vision" | "architecture" | "nature" | "reveal";

export type ScenePosition = "center" | "lower-left" | "upper-right" | "lower-center";

export type CameraMove = {
  scale: [from: number, to: number];
  /** Horizontal drift in % of the frame. */
  x: [from: number, to: number];
  /** Vertical drift in % of the frame. */
  y: [from: number, to: number];
};

export type CinematicScene = {
  id: SceneId;
  /** Progress at which the scene's copy starts entering. */
  start: number;
  /** Progress at which the scene's copy has fully left (ignored for the last scene). */
  end: number;
  /** Where the copy sits — chosen so it never covers the main building. */
  position: ScenePosition;
  /** Still used by the image-sequence fallback (and as the poster for this beat). */
  still: MediaKey;
  /** Slow camera move applied to the fallback still. */
  camera: CameraMove;
};

export const cinematicConfig = {
  video: {
    /** public/videos/star-hill-intro.mp4 — 16:9, H.264, all-intra or short GOP for smooth scrubbing. */
    src: "/videos/star-hill-intro",
    /** Optional portrait cut: public/videos/star-hill-intro-mobile.mp4 (falls back to `src`). */
    mobileSrc: "/videos/star-hill-intro-mobile",
    /** Optional poster: public/videos/star-hill-intro-poster.jpg (first frame of the film). */
    poster: "/videos/star-hill-intro-poster",
    /** Where to anchor the crop on portrait screens (CSS object-position). */
    mobileObjectPosition: "50% 50%",
    /**
     * Desktop only: download the whole file into memory before scrubbing.
     * Makes reverse seeking far smoother in Chromium; keep the file < ~20 MB.
     */
    preloadAsBlobOnDesktop: true,
  },

  /** Total scroll distance of the pinned intro, in small-viewport-heights. */
  scrollLength: { mobile: 340, desktop: 520 },
  mobileBreakpoint: 768,

  /** Timeline proportions (fractions of total progress). */
  textIn: 0.04,
  textOut: 0.03,
  lineStagger: 0.022,
  stillCrossfade: 0.05,

  /** 0–1. Lower = silkier, higher = more immediate. Shared by text & video. */
  smoothing: 0.14,
  /** Don't seek for differences smaller than this (seconds). */
  seekEpsilon: 1 / 60,
  /** Longest the page is held at the top while the film downloads; then scrolling is released regardless. */
  loaderMaxWaitMs: 10000,
  /** If the first seek never completes within this window, use the image fallback. */
  seekWatchdogMs: 3000,

  scenes: [
    {
      id: "arrival",
      start: 0,
      end: 0.17,
      position: "center",
      still: "arch-aerial",
      camera: { scale: [1.0, 1.14], x: [0, 0], y: [0, -2] },
    },
    {
      id: "vision",
      start: 0.2,
      end: 0.39,
      position: "lower-left",
      still: "arch-sculptural",
      camera: { scale: [1.06, 1.2], x: [1.5, -2], y: [0, 0] },
    },
    {
      id: "architecture",
      start: 0.42,
      end: 0.6,
      position: "upper-right",
      still: "arch-facade",
      camera: { scale: [1.18, 1.04], x: [0, 0], y: [-2, 1] },
    },
    {
      id: "nature",
      start: 0.63,
      end: 0.8,
      position: "lower-center",
      still: "land-hills",
      camera: { scale: [1.0, 1.1], x: [2, -2], y: [0, 0] },
    },
    {
      id: "reveal",
      start: 0.83,
      end: 1,
      position: "center",
      still: "arch-hero",
      camera: { scale: [1.12, 1.0], x: [0, 0], y: [1, 0] },
    },
  ] satisfies CinematicScene[],
} as const;

export type CinematicStatus = "loading" | "ready" | "active" | "completed" | "fallback" | "static";
