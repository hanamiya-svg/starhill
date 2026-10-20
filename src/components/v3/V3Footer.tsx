import { cacheLife } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";
import { v3Order } from "./nav";

async function year() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

/** Rounded dark card: tagline, pill links, contact, fine print. */
export async function V3Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const locale = (await getLocale()) as "mn" | "en";
  const y = await year();
  const { email, phone, website } = siteConfig.contact;

  return (
    <footer className="px-2 pb-2 md:px-4 md:pb-4">
      <div className="rounded-[2.5rem] bg-deep px-gutter pt-16 pb-8 text-white md:pt-24">
        <div className="mx-auto grid max-w-[96rem] gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Logo variant="stacked" sizes="180px" className="h-auto w-36 brightness-0 invert" />
            <p className="mt-8 max-w-md font-luxe text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] font-light ">{t("tagline")}</p>
          </div>
          <nav aria-label={t("navHeading")} className="md:col-span-6">
            <ul className="flex flex-wrap gap-2">
              {v3Order.map((k) => (
                <li key={k}>
                  <a href={`#${sectionIds[k]}`} className="inline-block rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-soft hover:text-fg">
                    {tn(k)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-1 text-sm text-white/70">
              <p>{siteConfig.location.address?.[locale]}</p>
              {phone ? <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">{phone}</a> : null}
              {email ? <a href={`mailto:${email}`} className="hover:text-white">{email}</a> : null}
              {website ? <p>{website}</p> : null}
            </div>
          </nav>
        </div>
        <div className="mx-auto mt-16 flex max-w-[96rem] flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            {t("rights", { year: y })} · {t("disclaimer")}
          </p>
          <div className="flex items-center gap-6 text-white/80">
            <LanguageSwitcher />
            <a href="#top" className="rounded-full bg-white/10 px-4 py-2 hover:bg-soft/20">
              ↑ {t("backToTop")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
