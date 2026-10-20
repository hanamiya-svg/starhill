import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";
import { versions } from "@/lib/versions";

export default function sitemap(): MetadataRoute.Sitemap {
  return versions.flatMap((v) => {
    const languages = Object.fromEntries(routing.locales.map((l) => [l, `${siteConfig.url}/${v}/${l}`]));
    return routing.locales.map((locale) => ({ url: `${siteConfig.url}/${v}/${locale}`, alternates: { languages } }));
  });
}
