"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical travel in px. Kept small on purpose. */
  y?: number;
  as?: "div" | "li" | "p" | "span" | "header" | "figure";
};

/** Text reveal: a quiet fade with a small rise. */
export function Reveal({ children, className, delay = 0, y = 20, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -6% 0px" }}
      transition={{ duration: reduce ? 0.3 : 1.1, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/**
 * Handwritten-title reveal: a feathered mask sweeps across like a pen stroke
 * while the letters sharpen (see `.ink-reveal` in src/styles/base.css).
 */
export function InkReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  return (
    <div
      ref={ref}
      data-inview={inView}
      className={`ink-reveal ${className ?? ""}`}
      style={{ "--ink-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Image reveal: the picture simply fades in and settles from a barely
 * perceptible zoom, then keeps a slow parallax drift as the page scrolls.
 * No wipes, curtains or blur — the photography carries the moment.
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
  parallax = 5,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Parallax travel in % of the frame height (0 to disable). */
  parallax?: number;
  /** Accepted for compatibility; direction no longer affects the animation. */
  from?: "bottom" | "left" | "right";
  curtain?: "champagne" | "forest" | "none";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const travel = reduce ? 0 : parallax;
  const drift = useTransform(scrollYProgress, [0, 1], [`-${travel}%`, `${travel}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div className="absolute inset-x-0" style={{ top: `-${travel}%`, bottom: `-${travel}%`, y: drift }}>
        <motion.div
          className="h-full w-full"
          initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduce ? 0.4 : 1.6, ease: EASE, delay }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
