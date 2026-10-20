import type { SectionKey } from "@/lib/navigation";

/** v2 content order (also the menu order). */
export const v2Order: SectionKey[] = [
  "introduction",
  "overview",
  "residences",
  "plans",
  "architecture",
  "experience",
  "nature",
  "location",
  "contact",
];
/** Split either side of the centred logo on desktop. */
export const v2LeftLinks: SectionKey[] = ["residences", "plans", "architecture"];
export const v2RightLinks: SectionKey[] = ["experience", "location"];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
export const roman = (n: number) => ROMAN[n - 1] ?? String(n);
export const numeral = (key: SectionKey) => roman(v2Order.indexOf(key) + 1);
