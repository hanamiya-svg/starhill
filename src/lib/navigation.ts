/** Section anchors, in page order. Labels come from messages → nav.<key>. */
export const sectionIds = {
  introduction: "introduction",
  architecture: "architecture",
  nature: "nature",
  experience: "experience",
  residences: "residences",
  plans: "plans",
  overview: "overview",
  location: "location",
  contact: "contact",
} as const;

export type SectionKey = keyof typeof sectionIds;

/** Links shown in the header (desktop) — kept deliberately short. */
export const headerLinks: SectionKey[] = ["architecture", "experience", "residences", "plans", "location"];

/** Links shown in the mobile menu and footer. */
export const fullLinks: SectionKey[] = [
  "introduction",
  "architecture",
  "nature",
  "experience",
  "residences",
  "plans",
  "overview",
  "location",
  "contact",
];
