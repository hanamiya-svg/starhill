"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Index · drawn hairline · label — the rule draws in, then the words follow. */
export function SectionLabel({
  index,
  children,
  tone = "dark",
  className,
}: {
  index?: string;
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const fade = (delay: number) => ({
    hidden: { opacity: 0, x: reduce ? 0 : -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE, delay } },
  });
  return (
    <motion.p
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      className={`label-caps flex items-center gap-4 ${tone === "light" ? "text-champagne" : "text-gold-deep"} ${
        className ?? ""
      }`}
    >
      {index ? (
        <motion.span variants={fade(0)} className="tabular-nums">
          {index}
        </motion.span>
      ) : null}
      <motion.span
        aria-hidden
        className={`h-px w-12 origin-left ${tone === "light" ? "bg-champagne/60" : "bg-gold-deep/50"}`}
        variants={{
          hidden: { scaleX: 0 },
          visible: { scaleX: 1, transition: { duration: reduce ? 0.2 : 1.1, ease: EASE, delay: 0.1 } },
        }}
      />
      <motion.span variants={fade(0.45)}>{children}</motion.span>
    </motion.p>
  );
}
