import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main data-nav-theme="dark" className="flex min-h-svh flex-col items-center justify-center gap-10 bg-forest px-gutter text-center text-ivory">
      <Logo variant="emblem" sizes="240px" className="h-auto w-48 md:w-60" />
      <h1 data-size="title" className="title-script">{t("heading")}</h1>
      <Link href="/" className="label-caps link-draw pb-1">
        {t("back")}
      </Link>
    </main>
  );
}
