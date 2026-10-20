import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

/** Small mono pill with a terracotta dot. */
export function V3Pill({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase ${
 tone === "light" ? "border-fg/15 bg-card text-fg/75" : "border-white/20 bg-white/5 text-white/80"
 }`}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

/** Pill label, then a light bookish serif title and an optional lede. */
export function V3Head({
  label,
  title,
  id,
  intro,
  align = "left",
  tone = "light",
}: {
  label: string;
  title: ReactNode;
  id?: string;
  intro?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const center = align === "center";
  return (
    <div className={center ? "mx-auto flex max-w-3xl flex-col items-center text-center" : "max-w-3xl"}>
      <V3Pill tone={tone}>{label}</V3Pill>
      <Reveal y={16}>
        <h2 id={id} className="mt-6 font-luxe text-[clamp(2.2rem,5.2vw,4.6rem)] leading-[1.04] font-light text-balance">
          {title}
        </h2>
      </Reveal>
      {intro ? (
        <Reveal delay={0.12}>
          <p className={`mt-5 max-w-xl text-[1rem] leading-[1.75] ${tone === "light" ? "text-fg/65" : "text-white/65"}`}>{intro}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
