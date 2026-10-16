"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

export type ZoomImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Serve the file as-is (line drawings stay crisp and the PNGs are already small). */
  unoptimized?: boolean;
};

export type ZoomLabels = {
  zoomIn: string;
  zoomOut: string;
  reset: string;
  fullscreen?: string;
};

type ZoomViewerProps = {
  image: ZoomImage;
  /** When this changes, the view returns to 1:1 (e.g. the floor id). */
  resetKey: string;
  /** Fill the parent (full screen) instead of locking to the image's aspect ratio. */
  fill?: boolean;
  /** A plain wheel zooms. Off by default so the page still scrolls over the plan; Ctrl/⌘ + wheel (trackpad pinch) always zooms. */
  wheelZoom?: boolean;
  labels: ZoomLabels;
  onFullscreen?: () => void;
  className?: string;
};

const MIN = 1;
const MAX = 6;
const STEP = 1.6;
const DOUBLE_CLICK = 2.5;
const KEY_PAN = 48;
const EASE = [0.22, 1, 0.36, 1] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Transform = { s: number; x: number; y: number };

/**
 * Pan & zoom frame for drawings. One transform layer holds the image; the
 * current transform lives in a ref and is written straight to the DOM, so
 * dragging never re-renders React. Only the zoom level is mirrored into state
 * for the controls.
 */
export function ZoomViewer({ image, resetKey, fill, wheelZoom, labels, onFullscreen, className }: ZoomViewerProps) {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const tRef = useRef<Transform>({ s: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; s: number } | null>(null);
  const moved = useRef(false);
  /** True while the view sits at its resting scale, so a resize re-fits instead of keeping a stale zoom. */
  const atBase = useRef(true);
  /** Resting scale (see restScale). A ref: it only changes together with the scale, which re-renders. */
  const baseRef = useRef(1);
  const [view, setView] = useState({ scale: 1, base: 1 });

  /** Displayed (object-contain) size of the image inside the frame at scale 1. */
  const fitted = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return { cw: 0, ch: 0, dw: 0, dh: 0 };
    const cw = frame.clientWidth;
    const ch = frame.clientHeight;
    const k = Math.min(cw / image.width, ch / image.height);
    return { cw, ch, dw: image.width * k, dh: image.height * k };
  }, [image.width, image.height]);

  /**
   * Resting scale. Normally 1 (whole drawing visible). On a narrow or portrait
   * frame a landscape drawing would shrink to a strip, so it fills the frame's
   * height instead and the visitor pans sideways; "reset" returns to that.
   */
  const restScale = useCallback(() => {
    const { cw, ch, dw, dh } = fitted();
    if (!dw || !dh) return 1;
    const cover = Math.max(cw / dw, ch / dh);
    return cw < 768 && cover > 1.35 ? Math.min(cover, 3.2, MAX) : 1;
  }, [fitted]);

  const apply = useCallback(
    (next: Transform, animate = false) => {
      const layer = layerRef.current;
      if (!layer) return;
      const s = clamp(next.s, MIN, MAX);
      const { cw, ch, dw, dh } = fitted();
      const bx = Math.max(0, (s * dw - cw) / 2);
      const by = Math.max(0, (s * dh - ch) / 2);
      const t = { s, x: clamp(next.x, -bx, bx), y: clamp(next.y, -by, by) };
      tRef.current = t;
      layer.style.transition = animate && !reduce ? "transform 0.5s var(--ease-out)" : "none";
      layer.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.s})`;
      const base = baseRef.current;
      setView((prev) => (Math.abs(prev.scale - s) < 0.001 && prev.base === base ? prev : { scale: s, base }));
    },
    [fitted, reduce],
  );

  const reset = useCallback(
    (animate = false) => {
      const b = restScale();
      atBase.current = true;
      baseRef.current = b;
      apply({ s: b, x: 0, y: 0 }, animate);
    },
    [apply, restScale],
  );

  /** Zoom towards a point given relative to the frame's centre. */
  const zoomAt = useCallback(
    (targetScale: number, px = 0, py = 0, animate = false) => {
      const t = tRef.current;
      const s = clamp(targetScale, MIN, MAX);
      const k = s / t.s;
      atBase.current = false;
      apply({ s, x: px - (px - t.x) * k, y: py - (py - t.y) * k }, animate);
    },
    [apply],
  );

  const pointInFrame = (clientX: number, clientY: number) => {
    const r = frameRef.current!.getBoundingClientRect();
    return { px: clientX - (r.left + r.width / 2), py: clientY - (r.top + r.height / 2) };
  };

  // Back to rest whenever the subject changes; on resize, re-fit if still at rest.
  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const ro = new ResizeObserver(() => (atBase.current ? reset() : apply(tRef.current)));
    ro.observe(frame);
    return () => ro.disconnect();
  }, [apply, reset]);

  // Wheel must be non-passive to stop the page scrolling while zooming.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (e: WheelEvent) => {
      const pinching = e.ctrlKey || e.metaKey;
      if (!wheelZoom && !pinching) return;
      e.preventDefault();
      const { px, py } = pointInFrame(e.clientX, e.clientY);
      const factor = Math.exp(-e.deltaY * (pinching ? 0.01 : 0.0018));
      zoomAt(tRef.current.s * factor, px, py);
    };
    frame.addEventListener("wheel", onWheel, { passive: false });
    return () => frame.removeEventListener("wheel", onWheel);
  }, [wheelZoom, zoomAt]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), s: tRef.current.s };
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const now = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, now);

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const { px, py } = pointInFrame((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomAt((pinch.current.s * d) / pinch.current.d, px, py);
      moved.current = true;
      return;
    }
    if (pointers.current.size === 1 && tRef.current.s > 1.001) {
      const t = tRef.current;
      apply({ s: t.s, x: t.x + (now.x - prev.x), y: t.y + (now.y - prev.y) });
      if (Math.hypot(now.x - prev.x, now.y - prev.y) > 1) moved.current = true;
    }
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  };

  const onDoubleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const { px, py } = pointInFrame(e.clientX, e.clientY);
    if (tRef.current.s > baseRef.current * 1.05) reset(true);
    else zoomAt(baseRef.current * DOUBLE_CLICK, px, py, true);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const t = tRef.current;
    const pan = (dx: number, dy: number) => {
      if (t.s <= 1) return false;
      apply({ s: t.s, x: t.x + dx, y: t.y + dy }, true);
      return true;
    };
    let handled = true;
    switch (e.key) {
      case "+":
      case "=":
        zoomAt(t.s * STEP, 0, 0, true);
        break;
      case "-":
      case "_":
        zoomAt(t.s / STEP, 0, 0, true);
        break;
      case "0":
        reset(true);
        break;
      case "ArrowLeft":
        handled = pan(KEY_PAN, 0);
        break;
      case "ArrowRight":
        handled = pan(-KEY_PAN, 0);
        break;
      case "ArrowUp":
        handled = pan(0, KEY_PAN);
        break;
      case "ArrowDown":
        handled = pan(0, -KEY_PAN);
        break;
      default:
        handled = false;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const { scale, base } = view;
  const zoomed = scale > base + 0.001;
  const canPan = scale > 1.001;
  // Phones get a taller frame (the drawing fills its height); from md the frame takes the image's shape.
  const frameStyle: CSSProperties = fill ? {} : ({ "--ar": `${image.width} / ${image.height}` } as CSSProperties);

  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        ref={frameRef}
        role="img"
        aria-label={image.alt}
        tabIndex={0}
        // Resting on the page, vertical swipes keep scrolling the page; once zoomed in (or full screen) the frame owns every gesture.
        style={{ ...frameStyle, touchAction: zoomed || fill ? "none" : "pan-y" }}
        className={`relative w-full overflow-hidden select-none outline-none focus-visible:ring-1 focus-visible:ring-champagne ${
          fill ? "h-full" : "aspect-[4/3] md:[aspect-ratio:var(--ar)]"
        } ${canPan ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        onDragStart={(e) => e.preventDefault()}
      >
        <div ref={layerRef} className="absolute inset-0 will-change-transform">
          <AnimatePresence initial={false}>
            <motion.div
              key={image.src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.15 : 0.6, ease: EASE }}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="100vw"
                quality={90}
                unoptimized={image.unoptimized}
                draggable={false}
                className="object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end md:inset-x-4 md:bottom-4">
        <div className="pointer-events-auto flex items-center bg-obsidian/85 text-ivory shadow-[0_8px_30px_rgb(17_20_18/0.25)] backdrop-blur">
          <ViewerButton label={labels.zoomOut} onClick={() => zoomAt(tRef.current.s / STEP, 0, 0, true)} disabled={!canPan}>
            <Minus className="size-4" strokeWidth={1.25} />
          </ViewerButton>
          <span aria-live="polite" className="label-caps w-14 text-center text-[0.625rem] tabular-nums text-ivory/80">
            {Math.round((scale / base) * 100)}%
          </span>
          <ViewerButton label={labels.zoomIn} onClick={() => zoomAt(tRef.current.s * STEP, 0, 0, true)} disabled={scale >= MAX - 0.001}>
            <Plus className="size-4" strokeWidth={1.25} />
          </ViewerButton>
          <ViewerButton label={labels.reset} onClick={() => reset(true)} disabled={!zoomed && !canPan}>
            <RotateCcw className="size-4" strokeWidth={1.25} />
          </ViewerButton>
          {onFullscreen && labels.fullscreen ? (
            <ViewerButton label={labels.fullscreen} onClick={onFullscreen} className="border-l border-ivory/15">
              <Maximize2 className="size-4" strokeWidth={1.25} />
            </ViewerButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ViewerButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex size-11 items-center justify-center transition-opacity hover:bg-ivory/10 disabled:opacity-30 disabled:hover:bg-transparent ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
