/** V4 section anchors, in page order. Labels come from messages → v4.nav.<key>. */
export const sectionIds = {
  introduction: "introduction",
  planning: "planning",
  sports: "sports",
  residences: "residences",
  advantages: "advantages",
  contact: "contact",
} as const;

export type SectionKey = keyof typeof sectionIds;

/** The five main sections, in the order the header shows them. */
export const headerLinks: SectionKey[] = ["introduction", "planning", "sports", "residences", "advantages"];

/** Links shown in the mobile menu and footer. */
export const fullLinks: SectionKey[] = [...headerLinks, "contact"];
