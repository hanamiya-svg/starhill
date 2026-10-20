import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const locale = await getLocale();
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-deep px-gutter text-center text-white">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">404</p>
      <h1 className="max-w-xl font-luxe text-[clamp(2rem,5vw,3.5rem)] leading-tight">{t("heading")}</h1>
      <Link href={`/v2/${locale}`} className="border border-white/50 px-5 py-3 font-mono text-xs uppercase hover:bg-white hover:text-ink">
        {t("back")}
      </Link>
    </main>
  );
}
