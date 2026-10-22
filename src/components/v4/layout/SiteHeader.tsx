"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui/Logo";
import { headerLinks, sectionIds } from "@/components/v4/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NavigationMenu } from "./NavigationMenu";

/**
 * Fixed, minimal header. It reads `data-nav-theme` from whichever section is
 * underneath it and flips between light-on-dark and dark-on-light by setting a
 * data attribute — no React re-render during scroll.
 */
export function SiteHeader() {
  const t = useTranslations("nav");
  const tv = useTranslations("v4.nav");
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const probe = header.offsetHeight / 2;
      let current: HTMLElement | null = null;
      document.querySelectorAll<HTMLElement>("[data-nav-theme]").forEach((section) => {
        const r = section.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) current = section;
      });
      const section = current as HTMLElement | null;
      const theme = section?.dataset.navTheme ?? "light";
      // Transparent only over full-bleed media (the film); otherwise borrow the section's own colour.
      const solid = section && "navTransparent" in section.dataset ? "false" : "true";
      if (header.dataset.theme !== theme) header.dataset.theme = theme;
      if (header.dataset.solid !== solid) header.dataset.solid = solid;
      const bg = solid === "true" && section ? getComputedStyle(section).backgroundColor : "";
      if (header.style.backgroundColor !== bg) header.style.backgroundColor = bg;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      data-theme="dark"
      data-solid="false"
      className="group/header fixed inset-x-0 top-0 z-40 h-[var(--header-h)] text-ivory transition-[background-color,color,border-color] duration-500 data-[theme=light]:text-ink data-[solid=true]:border-b data-[solid=true]:border-line data-[theme=dark]:border-ivory/10 in-data-[menu=open]:border-transparent! in-data-[menu=open]:bg-transparent! in-data-[menu=open]:text-ivory!"
    >
      <div className="container-editorial flex h-full items-center justify-between gap-6">
        <a href="#top" aria-label={t("home")} className="relative z-[60] -my-1 block py-1">
          <Logo variant="horizontal" priority sizes="(min-width: 768px) 120px, 96px" alt="" className="h-12 w-auto md:h-14" />
        </a>

        <nav aria-label={t("primary")} className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {headerLinks.map((key) => (
              <li key={key}>
                <a
                  href={`#${sectionIds[key]}`}
                  className="label-caps link-draw pb-1 opacity-80 transition-opacity duration-300 hover:opacity-100"
                >
                  {tv(key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-6 md:gap-8">
          <LanguageSwitcher className="relative z-[60]" />
          <a
            href={`#${sectionIds.contact}`}
            className="label-caps hidden border border-current/40 px-5 py-3 transition-colors duration-300 hover:bg-current/10 lg:inline-block"
          >
            {t("cta")}
          </a>
          <NavigationMenu />
        </div>
      </div>
    </header>
  );
}
