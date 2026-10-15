import type { ReactNode } from "react";
import { InkReveal } from "./Reveal";

export { SectionLabel } from "./SectionLabel";

/** Handwritten section title, written on with the ink reveal. */
export function SectionHeading({
  id,
  children,
  className,
  size = "headline",
  delay = 0.25,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  size?: "display" | "headline" | "title";
  delay?: number;
}) {
  return (
    <InkReveal delay={delay}>
      <h2 id={id} data-size={size} className={`title-script text-balance ${className ?? ""}`}>
        {children}
      </h2>
    </InkReveal>
  );
}
