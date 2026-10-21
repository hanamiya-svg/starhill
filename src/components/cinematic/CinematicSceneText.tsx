import type { ReactNode } from "react";
import type { SiteVersion } from "@/lib/versions";
import type { SceneId, ScenePosition } from "./cinematic.config";

const POSITION_CLASSES: Record<ScenePosition, string> = {
  center: "items-center justify-center text-center",
  "lower-left": "items-end justify-start text-left pb-[22svh] md:pb-[18svh]",
  "upper-right": "items-start justify-end text-right pt-[24svh] md:pt-[22svh]",
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
  /** Which design dresses the film. */
  look?: SiteVersion;
  /** 1-based scene number and total, shown by the v2 design. */
  index?: number;
  total?: number;
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
  look = "v1",
  index,
  total,
}: CinematicSceneTextProps) {
  // ── v2 · noir: low-left, light Cormorant capitals, gold roman numeral.
  if (look === "v2") {
    const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
    return (
      <div data-scene={id} className="pointer-events-none absolute inset-0 flex items-end justify-start px-gutter pb-[20svh] text-left md:pb-[16svh]">
        <div className="max-w-[min(56rem,100%)]">
          {heading ? <div className="cine-line">{heading}</div> : null}
          {variant === "statement" && index && total ? (
            <p className="cine-line mb-6 flex items-center gap-4">
              <span className="font-luxe text-lg text-accent italic">{ROMAN[index - 1]}</span>
              <span aria-hidden className="h-px w-12 bg-accent/60" />
            </p>
          ) : null}
          {lines.map((line, i) =>
            variant === "subtitle" ? (
              <p key={i} className="cine-line mt-7 text-[0.625rem] font-medium tracking-[0.42em] text-white/80 uppercase md:text-[0.6875rem]">
                <span className={`inline-block ${intro ? "cine-sub-in" : ""}`}>{line}</span>
              </p>
            ) : (
              <p
                key={i}
                className="cine-line font-luxe text-[clamp(1.7rem,4.4vw,4.2rem)] leading-[1.08] font-light tracking-[0.06em] text-white uppercase [text-shadow:0_2px_30px_rgb(0_0_0/0.35)]"
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

  // ── v3 · deep green: every beat anchored bottom-left like a caption, script set straight on the footage.
  if (look === "v3") {
    return (
      <div data-scene={id} className="pointer-events-none absolute inset-0 flex items-end justify-start px-gutter pb-[18svh] text-left md:pb-[13svh]">
        <div className="max-w-[min(40rem,100%)]">
          {heading ? <div className="cine-line">{heading}</div> : null}
          {variant === "statement" && index && total ? (
            <p className="cine-line mb-4 flex items-center gap-3 text-[0.6875rem] tracking-[0.28em] text-white/75 uppercase tabular-nums">
              <span>{String(index).padStart(2, "0")}</span>
              <span aria-hidden className="h-px w-8 bg-gold/80" />
              <span className="text-white/45">{String(total).padStart(2, "0")}</span>
            </p>
          ) : null}
          {lines.map((line, i) =>
            variant === "subtitle" ? (
              <p key={i} className="cine-line mt-5 text-[0.6875rem] tracking-[0.3em] text-white/85 uppercase md:text-xs">
                <span className={`inline-block ${intro ? "cine-sub-in" : ""}`}>{line}</span>
              </p>
            ) : (
              <p
                key={i}
                className="cine-line v3-script text-[clamp(2.4rem,5vw,4.6rem)] text-balance text-white lowercase first-letter:uppercase [text-shadow:0_2px_28px_rgb(0_0_0/0.45)]"
              >
                {line}
              </p>
            ),
          )}
          {footer ? <div className="cine-line pointer-events-auto mt-8">{footer}</div> : null}
        </div>
      </div>
    );
  }

  // ── v1 · editorial (original).
  return (
    <div data-scene={id} className={`pointer-events-none absolute inset-0 flex px-gutter ${POSITION_CLASSES[position]}`}>
      <div className="max-w-[min(68rem,100%)]">
        {heading ? <div className="cine-line">{heading}</div> : null}
        {lines.map((line, i) =>
          variant === "subtitle" ? (
            <p key={i} className="cine-line label-caps mt-8 text-[0.6875rem] tracking-[0.32em] text-champagne md:mt-10 md:text-xs">
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
