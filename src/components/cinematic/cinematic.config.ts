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
  /** Second in the film where this scene rests (where scene stepping stops). */
  at: number;
  /** Show these scenes' lines too (the film has fewer shots than lines of copy). */
  copyFrom?: SceneId[];
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
     * Download the whole file into memory before scrubbing (desktop and phones).
     * Seeking a blob never waits on the network, so scrubbing stays smooth on
     * iOS Safari too, and the loader can show real progress. Keep files small
     * (desktop < ~25 MB, mobile < ~8 MB).
     */
    preloadAsBlob: true,
    /** Length of the film in seconds (used until the file reports its own). */
    duration: 15.96,
    /** iOS Low Power Mode refuses play(), and Safari then never decodes a frame. Give up on video after this long and scrub the stills. */
    firstFrameTimeoutMs: 4000,
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
  /**
   * The page stays at the top until the film has fully downloaded. There is no
   * time limit; only a stalled download (no bytes for this long) gives up, and
   * the intro then scrubs the stills instead so the visitor is never stuck.
   */
  downloadStallMs: 20000,
  /** Safety net for the pre-hydration hold: if the page script never takes over (failed bundle), scrolling returns after this long. */
  preHydrationFailsafeMs: 20000,
  /**
   * Scene-by-scene stepping. Inside the intro, any wheel tick, swipe or arrow
   * key glides the film to the next (or previous) scene — never parking
   * between scenes, never skipping two at once. Past the last scene the page
   * continues to the first section.
   */
  step: {
    enabled: true,
    /**
     * Film seconds per real second while gliding between scenes. 1 = the film
     * plays at its own speed (5 s → 9 s takes 4 s), at a constant pace.
     */
    speed: 1.3,
    /** Extra time for the last glide, as the film hands over to the page. */
    exitExtraMs: 500,
    /** Wheel events closer together than this belong to the same gesture (trackpad inertia). */
    gestureGapMs: 180,
    /** Minimum swipe distance on touch screens. */
    swipeMinPx: 12,
  },
  /** If the first seek never completes within this window, use the image fallback. */
  seekWatchdogMs: 3000,

  /**
   * Four shots, resting at 0 s, 5 s, 9 s and 15 s of the film. `start`/`end`
   * are the progress windows in which each scene's copy is on screen; they sit
   * around the resting points (at / duration ≈ 0, .31, .56, .94).
   */
  scenes: [
    {
      id: "arrival",
      at: 0,
      start: 0,
      end: 0.155,
      position: "center",
      still: "arch-aerial",
      camera: { scale: [1.0, 1.14], x: [0, 0], y: [0, -2] },
    },
    {
      id: "vision",
      at: 5,
      start: 0.17,
      end: 0.43,
      position: "lower-left",
      still: "arch-sculptural",
      camera: { scale: [1.06, 1.2], x: [1.5, -2], y: [0, 0] },
    },
    {
      id: "architecture",
      at: 9,
      start: 0.45,
      end: 0.74,
      position: "upper-right",
      still: "arch-facade",
      camera: { scale: [1.18, 1.04], x: [0, 0], y: [-2, 1] },
      copyFrom: ["architecture", "nature"],
    },
    {
      id: "reveal",
      at: 15,
      start: 0.76,
      end: 1,
      position: "center",
      still: "arch-hero",
      camera: { scale: [1.12, 1.0], x: [0, 0], y: [1, 0] },
    },
  ] satisfies CinematicScene[],
} as const;

export type CinematicStatus = "loading" | "ready" | "active" | "completed" | "fallback" | "static";
