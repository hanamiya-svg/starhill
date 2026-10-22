import { cacheLife } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "@/components/ui/Logo";
import { fullLinks, sectionIds } from "@/components/v4/navigation";
import { siteConfig } from "@/lib/site-config";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

async function getCopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("v4.nav");
  const tContact = await getTranslations("contact.direct");
  const locale = (await getLocale()) as "mn" | "en";
  const year = await getCopyrightYear();
  const { email, phone, website, phoneLabel } = siteConfig.contact;
  const address = siteConfig.location.address?.[locale];

  return (
    <footer data-nav-theme="dark" className="bg-obsidian text-ivory">
      <div className="container-editorial pt-24 pb-10 md:pt-32">
        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Logo variant="stacked" sizes="224px" className="h-auto w-44 md:w-56" />
            <p className="title-script mt-8 max-w-xs text-[2.4rem] text-champagne/90">{t("tagline")}</p>
          </div>

          <nav aria-label={t("navHeading")} className="md:col-span-3">
            <h2 className="label-caps text-ivory/50">{t("navHeading")}</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-1">
              {fullLinks.map((key) => (
                <li key={key}>
                  <a href={`#${sectionIds[key]}`} className="link-draw text-sm text-ivory/80 hover:text-ivory">
                    {tNav(key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-12 md:col-span-4">
            <div>
              <h2 className="label-caps text-ivory/50">{t("contactHeading")}</h2>
              {email || phone || address ? (
                <ul className="mt-6 space-y-3 text-sm text-ivory/80">
                  {address ? <li>{address}</li> : null}
                  {email ? (
                    <li>
                      <span className="sr-only">{tContact("email")}: </span>
                      <a href={`mailto:${email}`} className="link-draw hover:text-ivory">
                        {email}
                      </a>
                    </li>
                  ) : null}
                  {phone ? (
                    <li>
                      <span className="text-ivory/50">{phoneLabel[locale]}: </span>
                      <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="link-draw hover:text-ivory">
                        {phone}
                      </a>
                    </li>
                  ) : null}
                  {website ? (
                    <li>
                      <a href={`https://${website}`} className="link-draw hover:text-ivory">
                        {website}
                      </a>
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="mt-6 text-sm text-ivory/55">{t("contactPending")}</p>
              )}
            </div>
            <div>
              <h2 className="label-caps text-ivory/50">{t("followHeading")}</h2>
              {siteConfig.social.length ? (
                <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  {siteConfig.social.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-draw text-ivory/80 hover:text-ivory">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm text-ivory/55">{t("socialPending")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-6 border-t border-ivory/15 pt-8 text-xs text-ivory/55 md:mt-32 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:gap-8">
            <p>{t("rights", { year })}</p>
            <p>{t("disclaimer")}</p>
          </div>
          <div className="flex items-center justify-between gap-10 text-ivory/80">
            <LanguageSwitcher />
            <a href="#top" className="label-caps link-draw pb-1">
              {t("backToTop")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
