"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { cinematicConfig, type CinematicStatus, type SceneId } from "./cinematic.config";
import { CinematicSceneText } from "./CinematicSceneText";
import { CinematicVideo, type CinematicStill } from "./CinematicVideo";
import type { SiteVersion } from "@/lib/versions";

gsap.registerPlugin(ScrollTrigger);
// Phones resize the viewport whenever the address bar shows or hides; re-measuring
// then makes the pinned film jump. The layout does not depend on that height.
ScrollTrigger.config({ ignoreMobileResize: true });

export type CinematicCopy = {
  lines: Record<SceneId, string[]>;
  wordmark: string;
  wordmarkSub: string;
  cta: string;
  skip: string;
  scrollHint: string;
  loading: string;
  regionLabel: string;
  pending: string;
};

type CinematicStageProps = {
  copy: CinematicCopy;
  stills: CinematicStill[];
  video: { desktop: string | null; mobile: string | null; poster: string | null };
  /** id of the first content section — where "skip" and the final CTA lead. */
  nextSectionId: string;
  /** Which design dresses the film (same footage and timeline in every version). */
  look?: SiteVersion;
};


const { scenes } = cinematicConfig;

export function CinematicStage({ copy, stills, video, nextSectionId, look = "v1" }: CinematicStageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  /** Lets the "skip" link lift the loading hold before the browser follows the anchor. */
  const releaseHoldRef = useRef<() => void>(() => {});

  const hasVideo = Boolean(video.desktop);

  useEffect(() => {
    const root = rootRef.current;
    const sticky = stickyRef.current;
    if (!root || !sticky) return;

    const setStatus = (status: CinematicStatus) => {
      root.dataset.status = status;
    };

    // Reduced motion: a quiet, static opening frame. No pinning, no video, no scrubbing.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      setStatus("static");
      delete document.documentElement.dataset.cineHold;
      return;
    }

    const isMobile = window.matchMedia(`(max-width: ${cinematicConfig.mobileBreakpoint - 1}px)`).matches;
    const videoEl = videoRef.current;
    const videoSrc = isMobile ? video.mobile : video.desktop;
    const poster = root.querySelector<HTMLImageElement>("[data-poster]");
    const loader = root.querySelector<HTMLElement>("[data-loader]");
    const loaderArc = root.querySelector<SVGCircleElement>("[data-loader-arc]");
    const loaderPct = root.querySelector<HTMLElement>("[data-loader-pct]");

    let disposed = false;
    let objectUrl: string | null = null;
    let videoMode = Boolean(videoEl && videoSrc && videoEl.canPlayType("video/mp4"));
    let videoReady = false;
    let duration = 0;
    let everSeeked = false;
    let pendingSeekSince = 0;
    let firstFrameTimer = 0;
    let abortDownload = () => {};

    let target = 0;
    let current = 0;
    let raf = 0;

    // ── Loader: progress ring + the page held at the top until the film is downloaded ──
    // The hold never applies when the page opens on a #hash or mid-page. It ends when
    // the first frame paints, or when the download fails or stalls (the intro then
    // scrubs the stills), so nobody is ever stuck.
    let lastPct = -1;
    const setProgress = (fraction: number | null) => {
      if (!loader) return;
      if (fraction === null) {
        loader.dataset.indeterminate = "true";
        return;
      }
      delete loader.dataset.indeterminate;
      const pct = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
      if (pct === lastPct) return;
      lastPct = pct;
      // pathLength="100" on the circle, so the offset is simply the remaining percent.
      if (loaderArc) loaderArc.style.strokeDashoffset = String(100 - pct);
      if (loaderPct) loaderPct.textContent = String(pct);
    };

    const canHold = window.scrollY < 8 && !window.location.hash;
    let held = false;
    const blockScrollKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "End", "Home", " ", "Spacebar"]);
    const preventScroll = (e: Event) => {
      if (e.type === "keydown") {
        const key = (e as KeyboardEvent).key;
        const target = e.target as HTMLElement | null;
        if (!blockScrollKeys.has(key) || target?.closest("input, textarea, select, a, button")) return;
      }
      e.preventDefault();
    };
    const pinTop = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    const release = () => {
      // The pre-hydration hold is cleared unconditionally: it may be set even when the JS hold never engaged.
      delete document.documentElement.dataset.cineHold;
      if (!held) return;
      held = false;
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScroll);
      window.removeEventListener("scroll", pinTop);
      delete root.dataset.hold;
    };
    const hold = () => {
      if (!canHold) delete document.documentElement.dataset.cineHold;
      if (!canHold || held || disposed) return;
      held = true;
      root.dataset.hold = "true";
      document.documentElement.dataset.cineHold = "true";
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
      window.addEventListener("keydown", preventScroll);
      window.addEventListener("scroll", pinTop, { passive: true });
    };
    releaseHoldRef.current = release;

    const ctx = gsap.context(() => {
      // ── Text + fallback-camera timeline (duration normalised to 1) ──────────
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      const { textIn, textOut, lineStagger, stillCrossfade } = cinematicConfig;

      scenes.forEach((scene, i) => {
        const lines = gsap.utils.toArray<HTMLElement>(`[data-scene="${scene.id}"] .cine-line`, root);
        const isFirst = i === 0;
        const isLast = i === scenes.length - 1;

        if (!isFirst) {
          tl.fromTo(
            lines,
            { autoAlpha: 0, y: 40, filter: "blur(12px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: textIn, stagger: lineStagger },
            scene.start,
          );
        }
        if (!isLast) {
          tl.to(
            lines,
            { autoAlpha: 0, y: -24, filter: "blur(8px)", duration: textOut, stagger: lineStagger * 0.5, ease: "power2.in" },
            scene.end - textOut,
          );
        }

        // Image-sequence fallback: crossfade stills and drift a slow camera.
        const still = root.querySelector<HTMLElement>(`[data-still="${i}"]`);
        const camera = still?.querySelector<HTMLElement>("[data-camera]");
        const next = scenes[i + 1];
        const camStart = Math.max(0, scene.start - stillCrossfade);
        const camEnd = next ? next.start : 1;
        if (still && !isFirst) {
          tl.fromTo(still, { autoAlpha: 0 }, { autoAlpha: 1, duration: stillCrossfade, ease: "none" }, camStart);
        }
        if (camera) {
          tl.fromTo(
            camera,
            { scale: scene.camera.scale[0], xPercent: scene.camera.x[0], yPercent: scene.camera.y[0] },
            {
              scale: scene.camera.scale[1],
              xPercent: scene.camera.x[1],
              yPercent: scene.camera.y[1],
              duration: camEnd - camStart,
              ease: "none",
            },
            camStart,
          );
        }
      });

      // Scroll cue disappears as soon as the visitor starts moving.
      tl.to("[data-scroll-hint]", { autoAlpha: 0, duration: 0.03, ease: "none" }, 0.005);
      // Pad to exactly 1 so progress maps 1:1 onto the timeline.
      tl.set({}, {}, 1);
      tl.progress(0);

      // ── Single render loop: text, camera, video and progress UI share one value ──
      const render = (p: number) => {
        tl.progress(p);
        if (videoMode && videoReady && videoEl && duration > 0) {
          const t = Math.min(duration - 0.04, Math.max(0, p * duration));
          if (!videoEl.seeking && Math.abs(videoEl.currentTime - t) > cinematicConfig.seekEpsilon) {
            if (!everSeeked && !pendingSeekSince) pendingSeekSince = performance.now();
            videoEl.currentTime = t;
          }
        }
      };

      const tick = () => {
        const delta = target - current;
        current = Math.abs(delta) < 0.0004 ? target : current + delta * cinematicConfig.smoothing;
        render(current);

        // Seeking watchdog: if the browser never completes a seek, scrub stills instead.
        if (videoMode && pendingSeekSince && !everSeeked) {
          if (performance.now() - pendingSeekSince > cinematicConfig.seekWatchdogMs) {
            switchToFallback();
          }
        }

        raf = current === target ? 0 : requestAnimationFrame(tick);
      };

      const ensureLoop = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          target = self.progress;
          ensureLoop();
        },
        onRefresh: (self) => {
          target = self.progress;
          ensureLoop();
        },
        onToggle: (self) => {
          if (self.isActive) setStatus(videoMode ? (videoReady ? "active" : "loading") : "active");
        },
        onLeave: () => setStatus("completed"),
        onEnterBack: () => setStatus(videoMode && !videoReady ? "loading" : "active"),
      });

      root.dataset.ready = "true";
    }, root);

    // ── Video lifecycle ──────────────────────────────────────────────────────
    function switchToFallback() {
      if (!videoMode) return;
      videoMode = false;
      release();
      if (videoEl) {
        videoEl.style.opacity = "0";
        videoEl.removeAttribute("src");
        videoEl.load();
      }
      if (poster) poster.style.opacity = "0";
      setStatus("fallback");
    }

    const onMeta = () => {
      if (!videoEl) return;
      duration = Number.isFinite(videoEl.duration) ? videoEl.duration : 0;
      if (!duration) return switchToFallback();
      // The file is here; if no frame decodes soon (iOS Low Power Mode), use the stills.
      window.clearTimeout(firstFrameTimer);
      firstFrameTimer = window.setTimeout(() => {
        if (!videoReady) switchToFallback();
      }, cinematicConfig.video.firstFrameTimeoutMs);
    };
    const onLoadedData = () => {
      if (!videoEl || !videoMode) return;
      window.clearTimeout(firstFrameTimer);
      videoReady = true;
      videoEl.style.opacity = "1";
      setProgress(1);
      setStatus("ready");
      release();
      // Snap to the current scroll position immediately.
      videoEl.currentTime = Math.min(duration - 0.04, current * duration);
    };
    const onSeeked = () => {
      everSeeked = true;
      pendingSeekSince = 0;
    };
    const onError = () => switchToFallback();
    // Streaming (mobile) path: report how much of the film is buffered.
    const onProgress = () => {
      if (!videoEl || !duration || !videoEl.buffered.length) return;
      setProgress(videoEl.buffered.end(videoEl.buffered.length - 1) / duration);
    };

    if (videoMode && videoEl && videoSrc) {
      setStatus("loading");
      setProgress(null);
      hold();
      videoEl.addEventListener("loadedmetadata", onMeta);
      videoEl.addEventListener("loadeddata", onLoadedData);
      videoEl.addEventListener("seeked", onSeeked);
      videoEl.addEventListener("error", onError);
      videoEl.addEventListener("progress", onProgress);

      const attach = (src: string) => {
        if (disposed) return;
        videoEl.preload = "auto";
        videoEl.src = src;
        videoEl.load();
        // iOS only decodes frames for seeking after a play() call; muted inline playback is allowed.
        const p = videoEl.play();
        if (p) p.then(() => videoEl.pause()).catch(() => {});
      };

      if (cinematicConfig.video.preloadAsBlob) {
        // Read the body in chunks so the ring shows real download progress.
        // A stall (no bytes for downloadStallMs) aborts and falls back to the stills.
        const controller = new AbortController();
        abortDownload = () => controller.abort();
        let stallTimer = 0;
        const armStall = () => {
          window.clearTimeout(stallTimer);
          stallTimer = window.setTimeout(() => controller.abort(), cinematicConfig.downloadStallMs);
        };
        armStall();
        fetch(videoSrc, { signal: controller.signal })
          .then(async (res) => {
            if (!res.ok) throw new Error(String(res.status));
            const total = Number(res.headers.get("content-length")) || 0;
            const type = res.headers.get("content-type") ?? "video/mp4";
            const reader = res.body?.getReader();
            if (!reader) return res.blob();
            const chunks: BlobPart[] = [];
            let received = 0;
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              chunks.push(value);
              received += value.byteLength;
              armStall();
              if (!disposed) setProgress(total ? received / total : null);
            }
            return new Blob(chunks, { type });
          })
          .then((blob) => {
            window.clearTimeout(stallTimer);
            if (disposed) return;
            setProgress(1);
            objectUrl = URL.createObjectURL(blob);
            attach(objectUrl);
          })
          .catch(() => {
            window.clearTimeout(stallTimer);
            if (!disposed) switchToFallback();
          });
      } else {
        attach(videoSrc);
      }
    } else {
      setStatus("fallback");
      delete document.documentElement.dataset.cineHold;
    }

    // Fonts/images can shift layout after first paint; re-measure once settled.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      disposed = true;
      abortDownload();
      window.clearTimeout(firstFrameTimer);
      release();
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      if (videoEl) {
        videoEl.removeEventListener("loadedmetadata", onMeta);
        videoEl.removeEventListener("loadeddata", onLoadedData);
        videoEl.removeEventListener("seeked", onSeeked);
        videoEl.removeEventListener("error", onError);
        videoEl.removeEventListener("progress", onProgress);
        videoEl.pause();
        videoEl.removeAttribute("src");
        videoEl.load();
      }
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      ctx.revert();
      delete root.dataset.ready;
    };
  }, [video.desktop, video.mobile]);

  const nextHref = `#${nextSectionId}`;

  return (
    <section
      ref={rootRef}
      aria-label={copy.regionLabel}
      data-nav-theme="dark"
      data-nav-transparent
      data-status="loading"
      className="cine-root relative h-[var(--cine-len-m)] bg-forest text-ivory motion-reduce:h-svh md:h-[var(--cine-len-d)] motion-reduce:md:h-svh"
      style={{
        ["--cine-len-m" as string]: `${cinematicConfig.scrollLength.mobile}svh`,
        ["--cine-len-d" as string]: `${cinematicConfig.scrollLength.desktop}svh`,
      }}
    >
      {hasVideo ? (
        // Pre-hydration hold: on a slow connection the bundle arrives seconds after the
        // HTML, and nothing else could stop a visitor scrolling past an unpainted film.
        // Same rules as the JS hold (top of page, no #hash, motion allowed). If the stage
        // never takes over (failed bundle), a failsafe lets go so nobody is trapped.
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.hash||scrollY>8||matchMedia("(prefers-reduced-motion: reduce)").matches)return;var h=document.documentElement;h.dataset.cineHold="true";setTimeout(function(){if(!document.querySelector(".cine-root[data-hold]"))delete h.dataset.cineHold},${cinematicConfig.preHydrationFailsafeMs})}catch(e){}})()`,
          }}
        />
      ) : null}
      <div ref={stickyRef} className="cine-stage sticky top-0 h-svh w-full overflow-hidden">
        <CinematicVideo
          videoRef={videoRef}
          stills={stills}
          poster={video.poster}
          hasVideo={hasVideo}
          pendingLabel={copy.pending}
          mobileObjectPosition={cinematicConfig.video.mobileObjectPosition}
        />

        {/* Grading for legibility, per design. */}
        {look === "v2" ? (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgb(8_13_10/0.85)_0%,rgb(8_13_10/0.2)_45%,rgb(8_13_10/0.35)_100%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(8_13_10/0.55)_0%,rgb(8_13_10/0)_60%)]" />
          </>
        ) : look === "v3" ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(10_20_15/0.45)_0%,rgb(10_20_15/0.1)_35%,rgb(10_20_15/0.6)_100%)]" />
        ) : (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(17_20_18/0.55)_0%,rgb(17_20_18/0)_26%,rgb(17_20_18/0)_58%,rgb(17_20_18/0.6)_100%)]"
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-obsidian/25" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(17_20_18/0.28)_0%,rgb(17_20_18/0)_65%)]"
            />
          </>
        )}

        {/* Accessible summary: the animated copy below is decorative duplication. */}
        <div className="sr-only">
          <h1>{copy.wordmark} {copy.wordmarkSub} — {copy.lines.arrival.join(" ")}</h1>
          {scenes.slice(1).map((s) => (
            <p key={s.id}>{copy.lines[s.id].join(" ")}</p>
          ))}
        </div>

        <div aria-hidden className="absolute inset-0">
          {scenes.map((scene, i) => {
            const isFirst = i === 0;
            const isLast = i === scenes.length - 1;
            return (
              <CinematicSceneText
                key={scene.id}
                id={scene.id}
                position={scene.position}
                lines={copy.lines[scene.id]}
                variant={isFirst ? "subtitle" : "statement"}
                intro={isFirst}
                look={look}
                index={i + 1}
                total={scenes.length}
                heading={
                  isFirst && look === "v2" ? (
                    <span className="cine-logo-in block">
                      <span className="block font-luxe text-[clamp(2.8rem,9vw,8.5rem)] leading-none font-light tracking-[0.22em] text-white uppercase [margin-right:-0.22em]">
                        {copy.wordmark}
                      </span>
                      <span className="mt-5 flex items-center gap-4 text-[0.625rem] font-medium tracking-[0.5em] text-accent uppercase">
                        <span aria-hidden className="h-px w-10 bg-accent/70" />
                        {copy.wordmarkSub}
                      </span>
                    </span>
                  ) : isFirst && look === "v3" ? (
                    <span className="cine-logo-in block">
                      <span className="block font-luxe text-[clamp(2.6rem,8.5vw,7.5rem)] leading-none font-normal tracking-[0.3em] text-white uppercase [margin-right:-0.3em] [text-shadow:0_2px_40px_rgb(0_0_0/0.35)]">
                        {copy.wordmark}
                      </span>
                      <span className="mt-5 block text-[0.6875rem] tracking-[0.6em] text-white/80 uppercase [margin-right:-0.6em]">{copy.wordmarkSub}</span>
                    </span>
                  ) : isFirst ? (
                    <span className="cine-logo-in block">
                      <span className="block font-luxe text-[clamp(2.4rem,9vw,8rem)] leading-none font-normal tracking-[0.18em] [margin-right:-0.18em] text-ivory">
                        {copy.wordmark}
                      </span>
                      <span className="label-caps mt-4 block text-[0.6875rem] tracking-[0.6em] [margin-right:-0.6em] text-ivory/75 md:mt-6 md:text-xs">
                        {copy.wordmarkSub}
                      </span>
                    </span>
                  ) : undefined
                }
                footer={
                  isLast && look === "v2" ? (
                    <a
                      href={nextHref}
                      tabIndex={-1}
                      className="group inline-flex items-center gap-4 border border-accent/70 px-7 py-4 text-[0.625rem] font-medium tracking-[0.32em] text-accent uppercase transition-colors duration-500 hover:bg-accent hover:text-paper"
                    >
                      {copy.cta}
                      <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" strokeWidth={1.25} />
                    </a>
                  ) : isLast && look === "v3" ? (
                    <a
                      href={nextHref}
                      tabIndex={-1}
                      className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-white"
                    >
                      {copy.cta}
                      <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" strokeWidth={1.5} />
                    </a>
                  ) : isLast ? (
                    <div className="flex flex-col items-center gap-10">
                      <span className="font-luxe text-base tracking-[0.3em] [margin-right:-0.3em] text-ivory/90 md:text-lg">{copy.wordmark}</span>
                      <a
                        href={nextHref}
                        tabIndex={-1}
                        className="label-caps group inline-flex items-center gap-3 border-b border-ivory/40 pb-2 text-ivory transition-colors hover:border-ivory"
                      >
                        {copy.cta}
                        <ArrowDown className="size-3.5 transition-transform duration-500 group-hover:translate-y-0.5" strokeWidth={1.25} />
                      </a>
                    </div>
                  ) : isFirst ? (
                    // Reduced-motion visitors see a single still frame, so offer the way in right here.
                    <a
                      href={nextHref}
                      tabIndex={-1}
                      className="label-caps hidden items-center gap-3 border-b border-ivory/40 pb-2 text-ivory motion-reduce:inline-flex"
                    >
                      {copy.cta}
                      <ArrowDown className="size-3.5" strokeWidth={1.25} />
                    </a>
                  ) : undefined
                }
              />
            );
          })}
        </div>

        {/* Loader — visible only while data-status="loading" (see src/styles/base.css). */}
        <div
          data-loader
          role="status"
          className="cine-loader pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-4 text-ivory/80 motion-reduce:hidden md:bottom-10"
        >
          <span aria-hidden className="cine-ring relative block size-16 md:size-[4.5rem]">
            <svg viewBox="0 0 48 48" className="cine-ring-svg absolute inset-0 size-full -rotate-90">
              <circle cx="24" cy="24" r="21" fill="none" strokeWidth="1" className="stroke-ivory/20" />
              <circle
                data-loader-arc
                cx="24"
                cy="24"
                r="21"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset="100"
                className="cine-ring-arc stroke-ivory"
              />
            </svg>
            <span className="cine-ring-pct absolute inset-0 flex items-center justify-center font-luxe text-sm text-ivory tabular-nums">
              <span data-loader-pct>0</span>
              <span className="text-[0.6em] text-ivory/60">%</span>
            </span>
          </span>
          <span className="label-caps text-[0.625rem] tracking-[0.3em]">{copy.loading}</span>
        </div>

        {/* Scroll cue */}
        <div data-cue-wrap className="cine-cue-wrap">
          {look === "v2" ? (
            <div
              data-scroll-hint
              aria-hidden
              className="pointer-events-none absolute right-0 bottom-0 flex flex-col items-center gap-4 px-gutter pb-8 text-[0.5625rem] tracking-[0.4em] text-white/70 uppercase motion-reduce:hidden [writing-mode:vertical-rl]"
            >
              {copy.scrollHint}
              <span className="scroll-cue relative block h-12 w-px overflow-hidden bg-accent/40 text-accent" />
            </div>
          ) : look === "v3" ? (
            <div
              data-scroll-hint
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 text-[0.6875rem] tracking-[0.24em] text-white/80 uppercase motion-reduce:hidden"
            >
              {copy.scrollHint}
              <span className="scroll-cue relative block h-10 w-px overflow-hidden bg-white/30" />
            </div>
          ) : (
            <div
              data-scroll-hint
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-20 flex flex-col items-center gap-4 text-ivory/80 motion-reduce:hidden md:bottom-12"
            >
              <span className="label-caps text-[0.625rem] tracking-[0.3em]">{copy.scrollHint}</span>
              <span className="scroll-cue relative block h-12 w-px overflow-hidden bg-ivory/25" />
            </div>
          )}
        </div>

        {/* Discreet exit — the intro must never trap anyone. */}
        <div
          data-skip
          className={`absolute bottom-0 px-gutter pb-6 motion-reduce:hidden md:pb-8 ${look === "v2" ? "left-0" : "right-0"}`}
        >
          <a
            href={nextHref}
            onClick={() => releaseHoldRef.current()}
            className={
              look === "v2"
                ? "text-[0.5625rem] tracking-[0.4em] text-white/60 uppercase transition-colors hover:text-accent"
                : look === "v3"
                  ? "text-xs tracking-[0.12em] text-white/70 transition-colors hover:text-white"
                  : "label-caps link-draw pb-1 text-ivory/70 transition-colors hover:text-ivory"
            }
          >
            {copy.skip}
          </a>
        </div>
      </div>
    </section>
  );
}
