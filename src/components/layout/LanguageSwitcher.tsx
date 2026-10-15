"use client";

import { useLocale, useTranslations } from "next-intl";
import type { MouseEvent } from "react";
import { routing, type AppLocale } from "@/i18n/routing";

const LABELS: Record<AppLocale, { short: string; name: string }> = {
  mn: { short: "MN", name: "Монгол" },
  en: { short: "EN", name: "English" },
};

/** The section currently under the header, so switching language keeps your place. */
function currentSectionHash(): string {
  const probe = 120;
  const sections = document.querySelectorAll<HTMLElement>("main section[id]");
  let hash = "";
  sections.forEach((s) => {
    const r = s.getBoundingClientRect();
    if (r.top <= probe && r.bottom > probe) hash = `#${s.id}`;
  });
  return hash;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("nav");

  // Each locale is its own root layout, so this is a full document navigation by
  // design; we only append the current section so the visitor keeps their place.
  const onSwitch = (event: MouseEvent<HTMLAnchorElement>, target: AppLocale) => {
    event.currentTarget.href = `/${target}${currentSectionHash()}`;
  };

  return (
    <nav aria-label={t("language")} className={`flex items-center gap-2 ${className ?? ""}`}>
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 ? (
            <span aria-hidden className="opacity-40">
              /
            </span>
          ) : null}
          {l === locale ? (
            <span aria-current="true" className="label-caps">
              <span className="sr-only">{LABELS[l].name}</span>
              <span aria-hidden>{LABELS[l].short}</span>
            </span>
          ) : (
            <a
              href={`/${l}`}
              hrefLang={l}
              lang={l}
              onClick={(e) => onSwitch(e, l)}
              className="label-caps opacity-55 transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100"
              aria-label={t("switchTo", { language: LABELS[l].name })}
            >
              {LABELS[l].short}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}
