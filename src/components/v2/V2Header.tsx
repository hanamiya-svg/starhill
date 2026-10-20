"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { LOCALE_LABELS, currentSectionHash, useLocaleHref } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/ui/Logo";
import { routing, type AppLocale } from "@/i18n/routing";
import { sectionIds, type SectionKey } from "@/lib/navigation";
import { roman, v2LeftLinks, v2Order, v2RightLinks } from "./nav";

/** Transparent over the film, then a dark blurred bar: links either side of a centred logo. */
export function V2Header() {
  const t = useTranslations("nav");
  const locale = useLocale() as AppLocale;
  const hrefFor = useLocaleHref();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const film = document.querySelector<HTMLElement>(".cine-root");
      const past = film ? film.getBoundingClientRect().bottom < 120 : scrollY > 80;
      if (ref.current) ref.current.dataset.solid = String(past);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
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

  const link = "text-[0.6875rem] font-medium tracking-[0.24em] text-fg/75 uppercase transition-colors hover:text-accent";
  const langs = (
    <nav aria-label={t("language")} className="flex items-center gap-2 text-[0.6875rem] tracking-[0.2em]">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden className="h-3 w-px bg-accent/40" /> : null}
          {l === locale ? (
            <span aria-current="true" className="text-accent">
              {LOCALE_LABELS[l].short}
            </span>
          ) : (
            <a href={hrefFor(l)} hrefLang={l} lang={l} onClick={(e) => onSwitch(e, l)} aria-label={t("switchTo", { language: LOCALE_LABELS[l].name })} className="text-fg/55 hover:text-fg">
              {LOCALE_LABELS[l].short}
            </a>
          )}
        </span>
      ))}
    </nav>
  );

  return (
    <header ref={ref} data-solid="false" className="v2-header fixed inset-x-0 top-0 z-40 h-[var(--header-h)] border-b border-transparent text-fg">
      <div className="container-editorial grid h-full grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className="flex items-center gap-8">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="v2-menu"
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 text-[0.6875rem] tracking-[0.24em] uppercase lg:hidden"
          >
            <span aria-hidden className="flex w-6 flex-col gap-1.5">
              <span className="h-px w-full bg-accent" />
              <span className="h-px w-2/3 bg-accent" />
            </span>
            {t("menu")}
          </button>
          <nav aria-label={t("primary")} className="hidden lg:block">
            <ul className="flex gap-8">
              {v2LeftLinks.map((k) => (
                <li key={k}>
                  <a href={`#${sectionIds[k]}`} className={link}>
                    {t(k)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <a href="#top" aria-label={t("home")} className="block">
          <Logo variant="horizontal" priority sizes="140px" alt="" className="h-11 w-auto md:h-12" />
        </a>

        <div className="flex items-center justify-end gap-8">
          <ul className="hidden gap-8 lg:flex">
            {v2RightLinks.map((k) => (
              <li key={k}>
                <a href={`#${sectionIds[k]}`} className={link}>
                  {t(k)}
                </a>
              </li>
            ))}
          </ul>
          {langs}
          <a
            href={`#${sectionIds.contact}`}
            className="hidden border border-accent/60 px-5 py-3 text-[0.625rem] font-medium tracking-[0.28em] text-accent uppercase transition-colors hover:bg-accent hover:text-paper xl:inline-block"
          >
            {t("cta")}
          </a>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="v2-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("primary")}
            className="fixed inset-0 z-50 flex flex-col bg-deep text-fg lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.15 : 0.5 }}
          >
            <div className="flex h-[var(--header-h)] items-center justify-between px-gutter">
              <button type="button" onClick={() => setOpen(false)} className="text-[0.6875rem] tracking-[0.24em] text-accent uppercase">
                {t("close")}
              </button>
              {langs}
            </div>
            <nav className="flex flex-1 flex-col items-center justify-center gap-1 overflow-y-auto px-gutter pb-10">
              {v2Order.map((k, i) => (
                <motion.a
                  key={k}
                  href={`#${sectionIds[k]}`}
                  onClick={go(k)}
                  className="group flex items-baseline gap-4 py-1.5"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="w-8 text-right font-luxe text-sm text-accent italic">{roman(i + 1)}</span>
                  <span className="font-luxe text-[2rem] leading-tight font-light group-active:text-accent">{t(k)}</span>
                </motion.a>
              ))}
              <a href={`#${sectionIds.contact}`} onClick={go("contact")} className="mt-8 border border-accent/60 px-7 py-4 text-[0.625rem] tracking-[0.3em] text-accent uppercase">
                {t("cta")}
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
