import { cacheLife } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";
import { v2Order } from "./nav";

async function year() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** Centred, quiet: stacked logo, italic tagline, gold-dotted index, fine print. */
export async function V2Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const locale = (await getLocale()) as "mn" | "en";
  const y = await year();
  const { email, phone, website, phoneLabel } = siteConfig.contact;

  return (
    <footer className="border-t border-rule bg-deep text-fg">
      <div className="container-editorial flex flex-col items-center py-20 text-center md:py-28">
        <Logo variant="stacked" sizes="200px" className="h-auto w-40 md:w-48" />
        <p className="mt-10 max-w-md font-luxe text-[clamp(1.8rem,3vw,2.6rem)] leading-tight font-light italic">{t("tagline")}</p>
        <nav aria-label={t("navHeading")} className="mt-12">
          <ul className="flex flex-wrap justify-center gap-x-2 gap-y-3">
            {v2Order.map((k, i) => (
              <li key={k} className="flex items-center gap-2">
                {i > 0 ? <span aria-hidden className="size-1 rounded-full bg-accent/60" /> : null}
                <a href={`#${sectionIds[k]}`} className="px-1 text-[0.6875rem] tracking-[0.22em] text-fg/65 uppercase transition-colors hover:text-accent">
                  {tn(k)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-12 space-y-1 text-sm font-light text-fg/65">
          <p>{siteConfig.location.address?.[locale]}</p>
          <p>
            {phone ? (
              <>
                <span className="text-fg/40">{phoneLabel[locale]}: </span>
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:text-accent">
                  {phone}
                </a>
              </>
            ) : null}
            {email ? (
              <>
                <span aria-hidden className="mx-3 text-accent/60">·</span>
                <a href={`mailto:${email}`} className="hover:text-accent">
                  {email}
                </a>
              </>
            ) : null}
          </p>
          {website ? <p>{website}</p> : null}
        </div>
      </div>
      <div className="container-editorial flex flex-col items-center gap-4 border-t border-rule py-6 text-[0.6875rem] font-light text-fg/40 md:flex-row md:justify-between">
        <p>
          {t("rights", { year: y })} · {t("disclaimer")}
        </p>
        <div className="flex items-center gap-8 text-fg/70">
          <LanguageSwitcher />
          <a href="#top" className="tracking-[0.2em] uppercase hover:text-accent">
            {t("backToTop")}
          </a>
        </div>
      </div>
    </footer>
  );
}
