import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Noto_Serif_Display, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HashScroll } from "@/components/v4/layout/HashScroll";
import { SiteFooter } from "@/components/v4/layout/SiteFooter";
import { SiteHeader } from "@/components/v4/layout/SiteHeader";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { sectionIds } from "@/components/v4/navigation";
import "@/styles/v4.css";

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

// Luxury title face: high-contrast Didone italic with full Mongolian Cyrillic.
const notoDisplay = Noto_Serif_Display({
  variable: "--font-noto-display",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400"],
  style: ["italic"],
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

export async function generateMetadata({ params }: LayoutProps<"/v4/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildMetadata("v4", locale);
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/v4/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${inter.variable} ${notoDisplay.variable} ${playfair.variable}`}
      data-scroll-behavior="smooth"
      data-version="v4"
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
