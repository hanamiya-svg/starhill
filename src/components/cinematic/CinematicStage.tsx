"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { cinematicConfig, type CinematicStatus, type SceneId } from "./cinematic.config";
import { CinematicSceneText } from "./CinematicSceneText";
import { CinematicVideo, type CinematicStill } from "./CinematicVideo";

gsap.registerPlugin(ScrollTrigger);

export type CinematicCopy = {
  lines: Record<SceneId, string[]>;
  wordmark: string;
  wordmarkSub: string;
  cta: string;
  skip: string;
  scrollHint: string;
  regionLabel: string;
  pending: string;
};

type CinematicStageProps = {
  copy: CinematicCopy;
  stills: CinematicStill[];
  video: { desktop: string | null; mobile: string | null; poster: string | null };
  /** id of the first content section — where "skip" and the final CTA lead. */
  nextSectionId: string;
};

const { scenes } = cinematicConfig;

export function CinematicStage({ copy, stills, video, nextSectionId }: CinematicStageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      return;
    }

    const isMobile = window.matchMedia(`(max-width: ${cinematicConfig.mobileBreakpoint - 1}px)`).matches;
    const videoEl = videoRef.current;
    const videoSrc = isMobile ? video.mobile : video.desktop;
    const poster = root.querySelector<HTMLImageElement>("[data-poster]");

    let disposed = false;
    let objectUrl: string | null = null;
    let videoMode = Boolean(videoEl && videoSrc && videoEl.canPlayType("video/mp4"));
    let videoReady = false;
    let duration = 0;
    let everSeeked = false;
    let pendingSeekSince = 0;

    let target = 0;
    let current = 0;
    let raf = 0;

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
      if (!duration) switchToFallback();
    };
    const onLoadedData = () => {
      if (!videoEl || !videoMode) return;
      videoReady = true;
      videoEl.style.opacity = "1";
      setStatus("ready");
      // Snap to the current scroll position immediately.
      videoEl.currentTime = Math.min(duration - 0.04, current * duration);
    };
    const onSeeked = () => {
      everSeeked = true;
      pendingSeekSince = 0;
    };
    const onError = () => switchToFallback();

    if (videoMode && videoEl && videoSrc) {
      setStatus("loading");
      videoEl.addEventListener("loadedmetadata", onMeta);
      videoEl.addEventListener("loadeddata", onLoadedData);
      videoEl.addEventListener("seeked", onSeeked);
      videoEl.addEventListener("error", onError);

      const attach = (src: string) => {
        if (disposed) return;
        videoEl.preload = "auto";
        videoEl.src = src;
        videoEl.load();
        // iOS only decodes frames for seeking after a play() call; muted inline playback is allowed.
        const p = videoEl.play();
        if (p) p.then(() => videoEl.pause()).catch(() => {});
      };

      if (!isMobile && cinematicConfig.video.preloadAsBlobOnDesktop) {
        fetch(videoSrc)
          .then((res) => {
            if (!res.ok) throw new Error(String(res.status));
            return res.blob();
          })
          .then((blob) => {
            if (disposed) return;
            objectUrl = URL.createObjectURL(blob);
            attach(objectUrl);
          })
          .catch(() => attach(videoSrc));
      } else {
        attach(videoSrc);
      }
    } else {
      setStatus("fallback");
    }

    // Fonts/images can shift layout after first paint; re-measure once settled.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      if (videoEl) {
        videoEl.removeEventListener("loadedmetadata", onMeta);
        videoEl.removeEventListener("loadeddata", onLoadedData);
        videoEl.removeEventListener("seeked", onSeeked);
        videoEl.removeEventListener("error", onError);
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
      <div ref={stickyRef} className="sticky top-0 h-svh w-full overflow-hidden">
        <CinematicVideo
          videoRef={videoRef}
          stills={stills}
          poster={video.poster}
          hasVideo={hasVideo}
          pendingLabel={copy.pending}
          mobileObjectPosition={cinematicConfig.video.mobileObjectPosition}
        />

        {/* Restrained grading for legibility — darker at the edges, clear in the middle. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(17_20_18/0.55)_0%,rgb(17_20_18/0)_26%,rgb(17_20_18/0)_58%,rgb(17_20_18/0.6)_100%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-obsidian/25" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(17_20_18/0.28)_0%,rgb(17_20_18/0)_65%)]"
        />

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
                heading={
                  isFirst ? (
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
                  isLast ? (
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

        {/* Scroll cue */}
        <div
          data-scroll-hint
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-20 flex flex-col items-center gap-4 text-ivory/80 motion-reduce:hidden md:bottom-12"
        >
          <span className="label-caps text-[0.625rem] tracking-[0.3em]">{copy.scrollHint}</span>
          <span className="scroll-cue relative block h-12 w-px overflow-hidden bg-ivory/25" />
        </div>

        {/* Discreet exit — the intro must never trap anyone. */}
        <div className="absolute right-0 bottom-0 px-gutter pb-6 motion-reduce:hidden md:pb-8">
          <a
            href={nextHref}
            className="label-caps link-draw pb-1 text-ivory/70 transition-colors hover:text-ivory"
          >
            {copy.skip}
          </a>
        </div>
      </div>
    </section>
  );
}
