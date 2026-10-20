"use client";

import Image from "next/image";
import { RotateCcw, LayoutPanelLeft } from "lucide-react";
import { useState, type ReactNode } from "react";

/**
 * A residence card that turns over: the photograph on the front, the
 * brochure floor plan on the back. Tap anywhere on the card, or the button,
 * to flip. Same footprint either way, so the page never grows.
 */
export function ResidenceFlipCard({
  front,
  plan,
  labels,
  className = "aspect-[4/5]",
}: {
  /** Sizing of the card (aspect ratio or height). */
  className?: string;
  front: ReactNode;
  plan: { src: string; alt: string; width: number; height: number };
  labels: { showPlan: string; showPhoto: string; planTag: string };
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={`flip-card relative ${className}`} data-flipped={flipped}>
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={flipped ? labels.showPhoto : labels.showPlan}
        onClick={() => setFlipped((v) => !v)}
        className="flip-inner group absolute inset-0 block w-full cursor-pointer text-left"
      >
        {/* Front: photograph */}
        <span className="flip-face absolute inset-0 block overflow-hidden" aria-hidden={flipped}>
          {front}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,rgb(17_20_18/0.45),transparent)]" />
        </span>

        {/* Back: floor plan */}
        <span className="flip-face flip-back absolute inset-0 block bg-white" aria-hidden={!flipped}>
          <span className="label-caps absolute top-4 left-4 text-[0.625rem] text-gold-deep">{labels.planTag}</span>
          <span className="absolute inset-x-4 top-10 bottom-16 block md:inset-x-6">
            <Image src={plan.src} alt={plan.alt} fill sizes="(min-width: 768px) 30vw, 90vw" unoptimized className="object-contain" />
          </span>
        </span>

        {/* Flip control, always on top and on the visible side */}
        <span
          className={`label-caps absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 px-3.5 py-2.5 text-[0.625rem] shadow-[0_6px_24px_rgb(17_20_18/0.18)] transition-colors duration-300 ${
            flipped ? "bg-ink text-ivory" : "bg-ivory/95 text-ink group-hover:bg-white"
          }`}
        >
          {flipped ? (
            <RotateCcw className="size-3.5" strokeWidth={1.5} aria-hidden />
          ) : (
            <LayoutPanelLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
          )}
          {flipped ? labels.showPhoto : labels.showPlan}
        </span>
      </button>
    </div>
  );
}
