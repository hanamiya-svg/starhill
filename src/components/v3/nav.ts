import type { SectionKey } from "@/lib/navigation";

/** v3 content order: setting first, then life, place, building, homes, facts, contact. */
export const v3Order: SectionKey[] = [
  "nature",
  "introduction",
  "experience",
  "location",
  "architecture",
  "residences",
  "plans",
  "overview",
  "contact",
];
export const v3HeaderLinks: SectionKey[] = ["nature", "experience", "residences", "plans", "location"];
