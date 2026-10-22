"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { fullLinks, sectionIds, type SectionKey } from "@/components/v4/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const EASE = [0.22, 1, 0.36, 1] as const;

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/** Mobile / tablet full-screen navigation. */
export function NavigationMenu() {
  const t = useTranslations("nav");
  const tv = useTranslations("v4.nav");
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    html.dataset.menu = "open";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a[href], button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      html.style.overflow = prev;
      delete html.dataset.menu;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  const go = (key: SectionKey) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    close(false);
    // Wait for the scroll lock to be released before scrolling.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(sectionIds[key])));
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="label-caps relative z-[60] flex h-11 items-center gap-3 lg:hidden"
      >
        <span>{open ? t("close") : t("menu")}</span>
        <span aria-hidden className="relative block h-2.5 w-6">
          <span
            className={`absolute left-0 block h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
              open ? "top-1/2 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 block h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-out)] ${
              open ? "top-1/2 -rotate-45" : "bottom-0"
            }`}
          />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("primary")}
            className="fixed inset-0 z-50 flex flex-col bg-forest text-ivory lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: reduce ? 0.2 : 0.8, ease: EASE }}
          >
            <nav
              aria-label={t("primary")}
              className="flex flex-1 flex-col justify-center overflow-y-auto px-gutter pt-[var(--header-h)] pb-10"
            >
              <ol className="space-y-1">
                {fullLinks.map((key, i) => (
                  <motion.li
                    key={key}
                    initial={reduce ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : 0.18 + i * 0.045 }}
                  >
                    <a
                      href={`#${sectionIds[key]}`}
                      onClick={go(key)}
                      className="group flex items-baseline gap-5 py-2"
                    >
                      <span className="label-caps w-6 text-champagne/70 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="title-script text-[clamp(2.1rem,9vw,3.4rem)] leading-[1.15] transition-opacity duration-300 group-hover:opacity-70">
                        {tv(key)}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ol>
            </nav>
            <div className="flex items-center justify-between border-t border-ivory/15 px-gutter py-6">
              <LanguageSwitcher />
              <a href={`#${sectionIds.contact}`} onClick={go("contact")} className="label-caps link-draw pb-1">
                {t("cta")}
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
