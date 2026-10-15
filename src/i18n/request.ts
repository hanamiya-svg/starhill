import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  // An explicit override (e.g. getTranslations({ locale })) wins over the URL segment.
  const candidate = locale ?? (await rootLocale());
  const resolved = hasLocale(routing.locales, candidate)
    ? candidate
    : routing.defaultLocale;

  return {
    locale: resolved,
    timeZone: "Asia/Ulaanbaatar",
    messages: (await import(`../../messages/${resolved}.json`)).default,
  };
});
