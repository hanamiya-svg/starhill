import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "@/styles/v1.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  title: "404 — STAR HILL Residence",
  robots: { index: false },
};

/** URLs that match no route at all. Each design has its own not-found for its own pages. */
export default function GlobalNotFound() {
  return (
    <html lang="mn" className={inter.variable}>
      <body>
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-forest px-gutter text-center text-ivory">
          <p className="label-caps text-champagne">404</p>
          <h1 className="font-luxe text-3xl">Хуудас олдсонгүй · Page not found</h1>
          <Link href="/v1/mn" className="label-caps link-draw pb-1">
            STAR HILL
          </Link>
        </main>
      </body>
    </html>
  );
}
