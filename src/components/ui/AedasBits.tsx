"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Counts the number inside a label up from zero when it scrolls into view
 * ("1,200+" → 0 … 1,200+). Text without a number is shown as is.
 */
export function CountUp({ value, durationMs = 1800, className }: { value: string; durationMs?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  // A number must start with a digit; keep any spacing around it ("4 regions").
  const m = value.match(/^(\D*?)(\d[\d,]*)(.*)$/);
  const target = m ? Number(m[2].replace(/,/g, "")) : NaN;
  const grouped = m ? m[2].includes(",") : false;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || Number.isNaN(target) || reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / durationMs);
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reduce, durationMs]);

  if (!m) return <span className={className}>{value}</span>;
  // Reduced motion: no count, just the figure.
  const current = reduce ? target : n;
  const shown = grouped ? current.toLocaleString("en-US") : String(current);
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="tabular-nums">
        {m[1]}
        {shown}
        {m[3]}
      </span>
    </span>
  );
}

/** A small laurel wreath drawn in the current colour, for award badges. */
export function Laurel({ className }: { className?: string }) {
  const leaves = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className} fill="currentColor">
      {[-1, 1].map((side) => (
        <g key={side} transform={side === 1 ? "translate(64 0) scale(-1 1)" : undefined}>
          <path d="M30 56 C18 50 11 39 12 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          {leaves.map((i) => {
            const t = i / 4;
            const x = 12.5 + t * 6 + Math.pow(t, 2) * 6;
            const y = 26 + t * 24;
            return <ellipse key={i} cx={x - 3.2} cy={y} rx="2.4" ry="5.2" transform={`rotate(${-35 + t * 25} ${x - 3.2} ${y})`} />;
          })}
          {leaves.slice(0, 4).map((i) => {
            const t = i / 4;
            const x = 12.5 + t * 6 + Math.pow(t, 2) * 6;
            const y = 30 + t * 22;
            return <ellipse key={`o${i}`} cx={x + 4} cy={y} rx="2.2" ry="4.6" transform={`rotate(${40 + t * 15} ${x + 4} ${y})`} />;
          })}
        </g>
      ))}
    </svg>
  );
}
