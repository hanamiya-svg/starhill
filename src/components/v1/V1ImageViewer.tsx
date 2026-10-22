"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Shown = { src: string; alt: string };

/** Event other v1 components dispatch to open an image (e.g. the residence flip cards). */
export const V1_ZOOM_EVENT = "v1:zoom";
export type V1ZoomDetail = Shown;

const INTERACTIVE = "a, button, input, select, textarea, label, [role='button'], [role='tab'], .cine-root, [data-no-zoom]";

/** Full-quality source: next/image URLs carry the original path in `url`. */
function originalSrc(img: HTMLImageElement) {
  const url = new URL(img.currentSrc || img.src, window.location.href);
  if (url.pathname.startsWith("/_next/image")) return url.searchParams.get("url") ?? img.src;
  return url.pathname;
}

function isZoomable(el: Element | null): el is HTMLImageElement {
  return el instanceof HTMLImageElement && Boolean(el.closest("main")) && !el.closest(INTERACTIVE) && el.getBoundingClientRect().width >= 80;
}

/**
 * V1 only: any content photograph or plan on the page opens full screen when
 * clicked (or focused and Enter/Space). The page layout is untouched — images
 * only gain a zoom-in cursor. Close with the button, Escape or the backdrop.
 */
export function V1ImageViewer({ labels }: { labels: { close: string; open: string } }) {
  const [shown, setShown] = useState<Shown | null>(null);
  const [loaded, setLoaded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((next: Shown) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setLoaded(false);
    setShown(next);
  }, []);
  const close = useCallback(() => {
    setShown(null);
    returnFocus.current?.focus?.({ preventScroll: true });
  }, []);

  // Mark eligible images (keyboard focus + cursor) and listen for clicks.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const mark = () => {
      main.querySelectorAll("img").forEach((img) => {
        if (img.dataset.zoomable !== undefined || !isZoomable(img)) return;
        img.dataset.zoomable = "";
        img.tabIndex = 0;
        img.setAttribute("aria-label", `${labels.open}: ${img.alt}`);
      });
    };
    mark();
    const observer = new MutationObserver(mark);
    observer.observe(main, { childList: true, subtree: true });

    const fromImage = (img: HTMLImageElement) => open({ src: originalSrc(img), alt: img.alt });
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || target.closest(INTERACTIVE)) return;
      // Overlays (gradients, captions) can sit above the photo: look through them.
      const img = isZoomable(target) ? target : document.elementsFromPoint(e.clientX, e.clientY).find(isZoomable);
      if (img) fromImage(img);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if ((e.key === "Enter" || e.key === " ") && el instanceof HTMLImageElement && el.dataset.zoomable !== undefined) {
        e.preventDefault();
        fromImage(el);
      }
    };
    const onZoom = (e: Event) => open((e as CustomEvent<V1ZoomDetail>).detail);

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener(V1_ZOOM_EVENT, onZoom);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(V1_ZOOM_EVENT, onZoom);
    };
  }, [labels.open, open]);

  // While open: Escape closes, the page does not scroll, focus starts on Close.
  useEffect(() => {
    if (!shown) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [shown, close]);

  return (
    <>
      <style>{`[data-zoomable]{cursor:zoom-in}[data-zoomable]:focus-visible{outline:2px solid var(--color-champagne,#c9b98a);outline-offset:3px}`}</style>
      {shown ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={shown.alt || labels.open}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgb(10_14_12/0.94)] p-3 backdrop-blur-sm md:p-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution original at its natural ratio */}
          <img
            src={shown.src}
            alt={shown.alt}
            onLoad={() => setLoaded(true)}
            className={`max-h-full max-w-full object-contain shadow-[0_20px_80px_rgb(0_0_0/0.5)] transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
          {!loaded ? <span aria-hidden className="absolute size-10 animate-spin rounded-full border-2 border-white/20 border-t-white/80" /> : null}
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={labels.close}
            className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white md:top-6 md:right-6"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      ) : null}
    </>
  );
}
