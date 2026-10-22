"use client";

import { useEffect } from "react";

/**
 * Lands on `#section` after a full navigation (e.g. switching language keeps the
 * visitor's place). The browser's own anchor jump can fire before the tall
 * cinematic intro and fonts have settled, so we re-apply it once layout is stable.
 */
export function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const jump = () => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    };
    jump();
    // Timers (unlike rAF) also run in background tabs.
    const timer = window.setTimeout(jump, 350);
    if (document.readyState !== "complete") window.addEventListener("load", jump, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", jump);
    };
  }, []);
  return null;
}
