import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { fileExistsInPublic, resolveMedia } from "@/lib/media";
import { siteConfig } from "@/lib/site-config";
import type { SiteVersion } from "@/lib/versions";

/** Shared page metadata; canonical and hreflang URLs carry the design version. */
export async function buildMetadata(version: SiteVersion, locale: AppLocale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const hero = resolveMedia("arch-hero");
  const ogImage = fileExistsInPublic("/opengraph.jpg") ? "/opengraph.jpg" : hero.src;
  const path = (l: string) => `/${version}/${l}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: t("title"),
    description: t("description"),
    applicationName: siteConfig.name,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: "/apple-touch-icon.png",
    },
    alternates: {
      canonical: path(locale),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, path(l)])),
        "x-default": path(routing.defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: t("title"),
      description: t("description"),
      url: path(locale),
      locale: locale === "mn" ? "mn_MN" : "en_US",
      alternateLocale: locale === "mn" ? ["en_US"] : ["mn_MN"],
      images: ogImage ? [{ url: ogImage, alt: t("ogAlt") }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: t("title"),
      description: t("description"),
    },
  };
}
