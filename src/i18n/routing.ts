import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["mn", "en"],
  defaultLocale: "mn",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
