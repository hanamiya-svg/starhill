import type { ReactNode } from "react";
import type { SceneId, ScenePosition } from "./cinematic.config";

const POSITION_CLASSES: Record<ScenePosition, string> = {
  center: "items-center justify-center text-center",
  "lower-left":
    "items-end justify-start text-left pb-[22svh] md:pb-[18svh]",
  "upper-right":
    "items-start justify-end text-right pt-[24svh] md:pt-[22svh]",
  "lower-center": "items-end justify-center text-center pb-[22svh] md:pb-[16svh]",
};

type CinematicSceneTextProps = {
  id: SceneId;
  position: ScenePosition;
  lines: string[];
  /** Wordmark for the opening/closing beats. */
  heading?: ReactNode;
  /** Extra animated element appended after the lines (e.g. CTA). */
  footer?: ReactNode;
  variant?: "statement" | "subtitle";
  /** Play the on-load entrance (opening frame only). */
  intro?: boolean;
};

/**
 * One scene's copy. Every animatable element carries `.cine-line` so the
 * timeline in CinematicStage can stagger them in order.
 */
export function CinematicSceneText({
  id,
  position,
  lines,
  heading,
  footer,
  variant = "statement",
  intro = false,
}: CinematicSceneTextProps) {
  return (
    <div
      data-scene={id}
      className={`pointer-events-none absolute inset-0 flex px-gutter ${POSITION_CLASSES[position]}`}
    >
      <div className="max-w-[min(68rem,100%)]">
        {heading ? <div className="cine-line">{heading}</div> : null}
        {lines.map((line, i) =>
          variant === "subtitle" ? (
            <p
              key={i}
              className="cine-line label-caps mt-8 text-[0.6875rem] tracking-[0.32em] text-champagne md:mt-10 md:text-xs"
            >
              <span className={`inline-block ${intro ? "cine-sub-in" : ""}`}>{line}</span>
            </p>
          ) : (
            <p
              key={i}
              className="cine-line font-luxe text-balance text-[clamp(1.55rem,4vw,3.9rem)] leading-[1.14] font-normal tracking-[0.04em] text-ivory uppercase"
            >
              {line}
            </p>
          ),
        )}
        {footer ? <div className="cine-line pointer-events-auto mt-10">{footer}</div> : null}
      </div>
    </div>
  );
}
