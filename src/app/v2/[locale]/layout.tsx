import type { Metadata, Viewport } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { HashScroll } from "@/components/layout/HashScroll";
import { V2Footer } from "@/components/v2/V2Footer";
import { V2Header } from "@/components/v2/V2Header";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { sectionIds } from "@/lib/navigation";
import "@/styles/v2.css";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = { themeColor: "#0b110e", colorScheme: "dark" };

export async function generateMetadata({ params }: LayoutProps<"/v2/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return buildMetadata("v2", locale);
}

export default async function V2Layout({ children, params }: LayoutProps<"/v2/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html
      lang={locale}
      data-version="v2"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-svh">
        <a
          href={`#${sectionIds.introduction}`}
          className="v2-label fixed top-3 left-3 z-[100] -translate-y-24 bg-paper px-4 py-3 transition-transform focus:translate-y-0"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <V2Header />
          {children}
          <V2Footer />
          <HashScroll />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
