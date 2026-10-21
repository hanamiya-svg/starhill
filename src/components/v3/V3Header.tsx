"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { LOCALE_LABELS, currentSectionHash, useLocaleHref } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { routing, type AppLocale } from "@/i18n/routing";
import { sectionIds, type SectionKey } from "@/lib/navigation";
import { v3HeaderLinks, v3Order } from "./nav";

/** Floating pill that slides away on the way down and returns on the way up. Bottom sheet menu on phones. */
export function V3Header() {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const hrefFor = useLocaleHref();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let last = scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = scrollY;
      const hide = y > 160 && y > last + 4;
      const show = y < last - 4 || y <= 160;
      if (ref.current && (hide || show)) ref.current.dataset.hidden = hide ? "true" : "false";
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (key: SectionKey) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.getElementById(sectionIds[key])?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })),
    );
  };
  const onSwitch = (e: MouseEvent<HTMLAnchorElement>, l: AppLocale) => {
    e.currentTarget.href = `${hrefFor(l)}${currentSectionHash()}`;
  };

  const langs = (
    <nav aria-label={t("language")} className="flex items-center rounded-full bg-soft p-1">
      {routing.locales.map((l) =>
        l === locale ? (
          <span key={l} aria-current="true" className="rounded-full bg-card px-3 py-1.5 font-mono text-[0.6875rem] text-fg shadow-sm">
            {LOCALE_LABELS[l].short}
          </span>
        ) : (
          <a
            key={l}
            href={hrefFor(l)}
            hrefLang={l}
            lang={l}
            onClick={(e) => onSwitch(e, l)}
            aria-label={t("switchTo", { language: LOCALE_LABELS[l].name })}
            className="rounded-full px-3 py-1.5 font-mono text-[0.6875rem] text-fg/55 transition-colors hover:text-fg"
          >
            {LOCALE_LABELS[l].short}
          </a>
        ),
      )}
    </nav>
  );

  return (
    <>
      <header ref={ref} data-hidden="false" className="v3-header fixed inset-x-0 top-3 z-40 flex justify-center px-3 md:top-5">
        <div className="flex w-full max-w-5xl items-center gap-2 rounded-full border border-gold/25 bg-card/80 p-1.5 pl-4 text-fg shadow-[0_10px_40px_rgb(42_39_33/0.12)] backdrop-blur-xl md:gap-4">
          <a href="#top" aria-label={t("home")} className="flex shrink-0 items-center gap-2.5">
            <Logo variant="monogram" sizes="20px" alt="" priority className="h-7 w-auto" />
            <span className="v3-script text-2xl leading-none">Star Hill</span>
          </a>
          <nav aria-label={t("primary")} className="mx-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {v3HeaderLinks.map((k) => (
                <li key={k}>
                  <a href={`#${sectionIds[k]}`} className="rounded-full px-3.5 py-2 text-sm text-fg/70 transition-colors hover:bg-soft hover:text-fg">
                    {t(k)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <span className="flex-1 lg:hidden" />
          {langs}
          <a
            href={`#${sectionIds.contact}`}
            className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-fg md:inline-block"
          >
            {t("cta")}
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="v3-menu"
            onClick={() => setOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-fg px-4 text-sm text-paper lg:hidden"
          >
            {t("menu")}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label={t("close")}
              className="fixed inset-0 z-50 bg-deep/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              id="v3-menu"
              aria-label={t("primary")}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-t-[2rem] bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-fg lg:hidden"
              initial={reduce ? { opacity: 0 } : { y: "100%" }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: "100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span aria-hidden className="mx-auto mb-4 block h-1 w-10 rounded-full bg-fg/20" />
              <ul className="grid grid-cols-2 gap-2">
                {v3Order.map((k) => (
                  <li key={k}>
                    <a href={`#${sectionIds[k]}`} onClick={go(k)} className="flex h-full rounded-2xl bg-paper px-4 py-4 font-luxe text-lg leading-tight">
                      {t(k)}
                    </a>
                  </li>
                ))}
              </ul>
              <a href={`#${sectionIds.contact}`} onClick={go("contact")} className="mt-3 flex justify-center rounded-full bg-accent py-4 text-sm font-medium text-accent-ink">
                {t("cta")}
              </a>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
