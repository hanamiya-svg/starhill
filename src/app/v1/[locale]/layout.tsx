import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Inter, Manrope, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HashScroll } from "@/components/layout/HashScroll";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { routing } from "@/i18n/routing";
import { fileExistsInPublic, resolveMedia } from "@/lib/media";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";
import "../globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Calligraphic italic — the handwritten title face for Mongolian (Great Vibes lacks Ө/Ү).
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  style: ["italic"],
  display: "swap",
});

// Luxury handwritten script for English titles.
const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
});

// High-contrast serif that echoes the logo's lettering (covers Mongolian Cyrillic).
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#18251F",
  colorScheme: "light",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const hero = resolveMedia("arch-hero");
  const ogImage = fileExistsInPublic("/opengraph.jpg") ? "/opengraph.jpg" : hero.src;

  return {
    metadataBase: new URL(siteConfig.url),
    title: t("title"),
    description: t("description"),
    applicationName: siteConfig.name,
    // Served from /public so these well-known requests never reach the [locale] route.
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: "/apple-touch-icon.png",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        mn: "/mn",
        en: "/en",
        "x-default": `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
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

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${inter.variable} ${cormorant.variable} ${greatVibes.variable} ${playfair.variable}`}
      data-scroll-behavior="smooth"
      // Browser extensions commonly add attributes to <html>.
      suppressHydrationWarning
    >
      <body className="min-h-svh">
        <a
          href={`#${sectionIds.introduction}`}
          className="label-caps fixed top-3 left-3 z-[100] -translate-y-24 bg-ink px-4 py-3 text-ivory transition-transform focus:translate-y-0"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
          <HashScroll />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
