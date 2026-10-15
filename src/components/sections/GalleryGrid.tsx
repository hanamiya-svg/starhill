"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArchitecturalPlaceholder } from "@/components/ui/ArchitecturalPlaceholder";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal } from "@/components/ui/Reveal";
import type { ResolvedMedia } from "@/lib/media-registry";

export type GalleryItem = { media: ResolvedMedia; alt: string; category: string };

type Labels = {
  /** ICU-less template: "{title}" is replaced. */
  open: string;
  dialog: string;
  close: string;
  next: string;
  previous: string;
  /** "{current} / {total}" */
  counter: string;
  pending: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** Repeating rhythm of spans/ratios so the grid reads as an editorial spread. */
const LAYOUT = [
  "col-span-2 md:col-span-7 aspect-[16/10]",
  "col-span-1 md:col-span-5 aspect-[4/5] md:aspect-auto",
  "col-span-1 md:col-span-4 aspect-[4/5] md:aspect-[3/4]",
  "col-span-2 md:col-span-8 aspect-[16/10] md:aspect-auto",
  "col-span-1 md:col-span-6 aspect-square md:aspect-[4/3]",
  "col-span-1 md:col-span-6 aspect-square md:aspect-[4/3]",
  "col-span-2 md:col-span-12 aspect-[16/10] md:aspect-[21/8]",
  "col-span-2 md:col-span-8 aspect-[16/9] md:aspect-auto",
  "col-span-2 md:col-span-4 aspect-[4/5] md:aspect-[3/4]",
  "col-span-1 md:col-span-5 aspect-[4/5]",
  "col-span-1 md:col-span-7 aspect-[4/5] md:aspect-auto",
  "col-span-2 md:col-span-12 aspect-[16/10] md:aspect-[21/8]",
];

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));

export function GalleryGrid({ items, labels }: { items: GalleryItem[]; labels: Labels }) {
  const [index, setIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <>
      <ul className="mt-16 grid grid-cols-2 gap-3 md:mt-24 md:grid-cols-12 md:gap-6">
        {items.map((item, i) => (
          <li key={item.media.key} className={`relative min-h-0 ${LAYOUT[i % LAYOUT.length]}`}>
            <button
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={fill(labels.open, { title: item.alt })}
              className="group absolute inset-0 block h-full w-full overflow-hidden text-left"
            >
              <ImageReveal className="h-full w-full" delay={(i % 3) * 0.1} parallax={3}>
                <MediaFrame
                  media={item.media}
                  alt=""
                  pendingLabel={labels.pending}
                  sizes="(min-width: 768px) 50vw, 50vw"
                  className="h-full w-full"
                  imageClassName="transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
              </ImageReveal>
              <span className="pointer-events-none absolute inset-0 bg-obsidian/0 transition-colors duration-500 group-hover:bg-obsidian/15" />
              <span className="label-caps pointer-events-none absolute top-4 left-4 translate-y-1 text-ivory opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                {item.category}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        items={items}
        index={index}
        labels={labels}
        onChange={setIndex}
        onClose={(last) => {
          setIndex(null);
          triggerRefs.current[last]?.focus();
        }}
      />
    </>
  );
}

function Lightbox({
  items,
  index,
  labels,
  onChange,
  onClose,
}: {
  items: GalleryItem[];
  index: number | null;
  labels: Labels;
  onChange: (i: number) => void;
  onClose: (last: number) => void;
}) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState(1);
  const open = index !== null;
  const total = items.length;

  const step = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      setDirection(dir);
      onChange((index + dir + total) % total);
    },
    [index, onChange, total],
  );

  useEffect(() => {
    if (index === null) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [index === null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (index === null) return;
    dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [index === null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(index);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>("button");
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
  }, [index, onClose, step]);

  const onPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) step(dx < 0 ? 1 : -1);
  };

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
          transition={{ duration: reduce ? 0.15 : 0.45, ease: EASE }}
        >
          <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-gutter">
            <p className="label-caps tabular-nums text-ivory/70" aria-live="polite">
              {fill(labels.counter, { current: String(index! + 1).padStart(2, "0"), total: String(total).padStart(2, "0") })}
            </p>
            <button
              type="button"
              data-autofocus
              onClick={() => onClose(index!)}
              className="-mr-3 flex size-11 items-center justify-center transition-opacity hover:opacity-70"
              aria-label={labels.close}
            >
              <X className="size-5" strokeWidth={1.25} />
            </button>
          </div>

          <div
            className="relative min-h-0 flex-1 touch-pan-y px-gutter select-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipe.current = null)}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.figure
                key={item.media.key}
                custom={direction}
                className="absolute inset-0 flex flex-col items-center justify-center px-gutter"
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -40 }}
                transition={{ duration: reduce ? 0.15 : 0.6, ease: EASE }}
              >
                <div className="relative h-full max-h-[calc(100svh-var(--header-h)*2-3rem)] w-full max-w-6xl">
                  {item.media.src ? (
                    <Image src={item.media.src} alt={item.alt} fill sizes="100vw" className="object-contain" />
                  ) : (
                    <ArchitecturalPlaceholder
                      art={item.media.art}
                      title={item.alt}
                      label={labels.pending}
                      className="absolute top-1/2 left-1/2 aspect-[16/10] max-h-full w-full max-w-full -translate-x-1/2 -translate-y-1/2"
                    />
                  )}
                </div>
                <figcaption className="mt-5 flex max-w-2xl flex-col items-center gap-2 text-center">
                  <span className="label-caps text-champagne">{item.category}</span>
                  <span className="text-sm text-ivory/70">{item.alt}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-gutter">
            <button
              type="button"
              onClick={() => step(-1)}
              className="label-caps -ml-3 flex h-11 items-center gap-3 px-3 transition-opacity hover:opacity-70"
              aria-label={labels.previous}
            >
              <ChevronLeft className="size-4" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="label-caps -mr-3 flex h-11 items-center gap-3 px-3 transition-opacity hover:opacity-70"
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
