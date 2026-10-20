import type { Metadata, Viewport } from "next";
import { Prata, Wix_Madefor_Text } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HashScroll } from "@/components/layout/HashScroll";
import { V3Footer } from "@/components/v3/V3Footer";
import { V3Header } from "@/components/v3/V3Header";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { sectionIds } from "@/lib/navigation";
import "@/styles/v3.css";

// Luxury display face for titles: a high-contrast Didone with full Mongolian Cyrillic.
const prata = Prata({
  variable: "--font-prata",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: "400",
  display: "swap",
});
// Handwritten titles: Great Vibes extended with Mongolian Ө ө Ү ү (see src/fonts/StarHillScript-OFL.txt).
const starScript = localFont({
  src: "../../../fonts/StarHillScript.woff2",
  variable: "--font-star-script",
  display: "swap",
});
const wixText = Wix_Madefor_Text({
  variable: "--font-wix-text",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#12221a", colorScheme: "dark" };

export async function generateMetadata({ params }: LayoutProps<"/v3/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildMetadata("v3", locale);
}

export default async function V3Layout({ children, params }: LayoutProps<"/v3/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html
      lang={locale}
      data-version="v3"
      data-scroll-behavior="smooth"
      className={`${starScript.variable} ${prata.variable} ${wixText.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-svh">
        <a
          href={`#${sectionIds.nature}`}
          className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-full bg-accent px-5 py-3 text-sm text-accent-ink transition-transform focus:translate-y-0"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <V3Header />
          {children}
          <V3Footer />
          <HashScroll />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
