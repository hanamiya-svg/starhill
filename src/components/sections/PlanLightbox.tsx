"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { ZoomViewer, type ZoomImage, type ZoomLabels } from "@/components/ui/ZoomViewer";

export type LightboxItem = ZoomImage & { id: string; title: string; subtitle?: string };

type Labels = ZoomLabels & { close: string; next: string; previous: string; dialog: string; hint: string };

const EASE = [0.22, 1, 0.36, 1] as const;

/** Full-screen plan viewer: one drawing at a time, pan/zoom, arrows to step between plans. */
export function PlanLightbox({
  items,
  index,
  labels,
  onChange,
  onClose,
}: {
  items: LightboxItem[];
  index: number | null;
  labels: Labels;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const total = items.length;

  const step = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onChange((index + dir + total) % total);
    },
    [index, onChange, total],
  );

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), [tabindex='0']");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, step]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.dialog}
          className="fixed inset-0 z-[70] flex flex-col bg-obsidian text-ivory"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.4, ease: EASE }}
        >
          <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between gap-6 px-gutter">
            <div className="min-w-0">
              <p className="truncate font-luxe text-base md:text-lg">{item.title}</p>
              {item.subtitle ? <p className="label-caps truncate text-[0.625rem] text-ivory/55">{item.subtitle}</p> : null}
            </div>
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              className="-mr-3 flex size-11 shrink-0 items-center justify-center transition-opacity hover:opacity-70"
              aria-label={labels.close}
            >
              <X className="size-5" strokeWidth={1.25} />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 px-gutter">
            <ZoomViewer
              key={item.id}
              image={item}
              resetKey={item.id}
              fill
              wheelZoom
              labels={{ zoomIn: labels.zoomIn, zoomOut: labels.zoomOut, reset: labels.reset }}
              className="h-full bg-white"
            />
          </div>

          <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-gutter">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={total < 2}
              className="-ml-3 flex h-11 items-center gap-3 px-3 transition-opacity hover:opacity-70 disabled:opacity-30"
              aria-label={labels.previous}
            >
              <ChevronLeft className="size-4" strokeWidth={1.25} />
            </button>
            <div className="flex min-w-0 flex-col items-center gap-1 text-center">
              <p className="label-caps tabular-nums text-ivory/60" aria-live="polite">
                {String(index! + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>
              <p className="hidden truncate text-[0.6875rem] text-ivory/35 md:block">{labels.hint}</p>
            </div>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={total < 2}
              className="-mr-3 flex h-11 items-center gap-3 px-3 transition-opacity hover:opacity-70 disabled:opacity-30"
              aria-label={labels.next}
            >
              <ChevronRight className="size-4" strokeWidth={1.25} />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
