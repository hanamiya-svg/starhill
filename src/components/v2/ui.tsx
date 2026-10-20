import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

/** Gold numeral + tracked label, a light Cormorant title, optional lede. */
export function V2Head({
  numeral,
  label,
  title,
  id,
  intro,
  align = "left",
}: {
  numeral: string;
  label: string;
  title: ReactNode;
  id?: string;
  intro?: ReactNode;
  align?: "left" | "center";
}) {
  const center = align === "center";
  return (
    <div className={center ? "mx-auto flex max-w-3xl flex-col items-center text-center" : "max-w-3xl"}>
      <Reveal y={10}>
        <p className={`flex items-center gap-4 ${center ? "justify-center" : ""}`}>
          <span className="font-luxe text-base text-accent italic">{numeral}</span>
          <span aria-hidden className="h-px w-10 bg-accent/50" />
          <span className="v2-label">{label}</span>
        </p>
      </Reveal>
      <Reveal y={18} delay={0.08}>
        <h2 id={id} className="mt-7 font-luxe text-[clamp(2.5rem,5.4vw,5rem)] leading-[1.02] font-light tracking-[-0.01em] text-balance">
          {title}
        </h2>
      </Reveal>
      {intro ? (
        <Reveal delay={0.16}>
          <p className="mt-7 max-w-xl text-[0.9375rem] leading-[1.85] font-light text-muted">{intro}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

/** Outline button in gold. */
export const v2Button =
  "inline-flex items-center gap-3 border border-accent/60 px-6 py-3.5 text-[0.625rem] font-medium tracking-[0.3em] text-accent uppercase transition-colors duration-500 hover:bg-accent hover:text-paper";
