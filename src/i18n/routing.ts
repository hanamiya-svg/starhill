import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["mn", "en"],
  defaultLocale: "mn",
  localePrefix: "always",
  // Always enter in Mongolian: no Accept-Language or cookie detection, "/" → "/mn".
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
