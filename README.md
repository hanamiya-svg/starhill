# STAR HILL — website

A frontend-only Next.js site: a scroll-driven cinematic intro, editorial sections and a brochure / meeting form, in Mongolian (`/mn`, default) and English (`/en`).

There is **no backend, database, API route or form transmission**. See "Contact form" below.

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /mn
npm run lint
npm run build && npm start
```

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://starhill.mn`) in production so canonical, hreflang and Open Graph URLs are absolute.

## Where things live

| What | Where |
| --- | --- |
| Copy (both languages) | `messages/mn.json`, `messages/en.json` |
| Project facts, contact details, socials, address, map, brochure path | `src/lib/site-config.ts` |
| Image registry (file names + placeholder art) | `src/lib/media-registry.ts` |
| Floor plans: floors, residences, areas, 3D layouts | `src/lib/floor-plans.ts` (drawings in `public/plans/`) |
| Cinematic pacing, scene order, text positions, camera moves | `src/components/cinematic/cinematic.config.ts` |
| Design tokens (colours, type scale, spacing) | `src/app/globals.css` |
| Sections | `src/components/sections/*` |
| Header, footer, menu, language switcher | `src/components/layout/*` |

## Adding the real assets

Nothing here is invented. Until a file exists, a clearly labelled abstract placeholder is shown (in development the label also names the expected path).

**Photographs** — drop into `public/images/…` with these base names (`.jpg`, `.jpeg`, `.webp`, `.avif` or `.png`):

```
public/images/architecture/hero.jpg               strongest overall shot (intro, finale, OG image)
public/images/architecture/aerial.jpg             wide aerial of the development
public/images/architecture/glass-facade.jpg       blue-tinted glass facade
public/images/architecture/sculptural-forms.jpg   layered building forms
public/images/architecture/evening-light.jpg      dusk, warm interior light
public/images/landscape/green-hills.jpg
public/images/landscape/landscaped-grounds.jpg
public/images/landscape/pedestrian-street.jpg
public/images/landscape/public-space.jpg
public/images/details/glass-reflection.jpg
```

The supplied originals (and stills taken from the master film) are kept in `source-media/images/`, outside `public/`, so they are never served. The files above are resized web copies (≤ 2560 px, panorama 3200 px). To swap a picture, resize it and save it over the matching file, e.g. `sips -Z 2560 -s formatOptions 82 original.jpg --out public/images/architecture/hero.jpg`. Each image's crop focus (`focus`) is set in `src/lib/media-registry.ts`.

Alt text for each lives under `media.<key>` in the message files. Adjust it if a photo differs from the description. Optional: `public/opengraph.jpg` (1200×630) overrides the social preview image.

**Cinematic video**

```
public/videos/star-hill-intro.mp4          16:9 desktop film (required for video mode)
public/videos/star-hill-intro-mobile.mp4   optional portrait cut (else the desktop file is cropped)
public/videos/star-hill-intro-poster.jpg   optional first frame, shown until the video can paint
source-media/star-hill-intro-master.mp4    the original master — kept out of public/, never served
```

**Never put the master file straight into `public/videos`.** A normal export (4K, HEVC, a keyframe every second) can only be seeked to its keyframes, so scrolling stalls and snaps from one frame to the next. The served files must be H.264 with a keyframe on **every** frame, no audio, and `faststart`. Re-create them from the master with:

```bash
ffmpeg -i source-media/star-hill-intro-master.mp4 -an -c:v libx264 -preset medium -profile:v high \
  -crf 23 -pix_fmt yuv420p -vf "scale=1920:-2,fps=30" -g 1 -keyint_min 1 -sc_threshold 0 \
  -movflags +faststart public/videos/star-hill-intro.mp4
ffmpeg -i source-media/star-hill-intro-master.mp4 -an -c:v libx264 -preset medium -profile:v high \
  -crf 28 -pix_fmt yuv420p -vf "crop=ih*9/16:ih,scale=960:-2,fps=24" -g 1 -keyint_min 1 -sc_threshold 0 \
  -movflags +faststart public/videos/star-hill-intro-mobile.mp4
ffmpeg -i source-media/star-hill-intro-master.mp4 -vframes 1 -vf "scale=1920:-2" -q:v 3 \
  public/videos/star-hill-intro-poster.jpg
```

Aim for ≤ ~25 MB desktop and ≤ ~8 MB mobile; raise `-crf` to shrink a file. Tune scene timings in `cinematic.config.ts` (`start`/`end` are fractions of the film) so each line lands on its shot.

**Floor plans** — `public/plans/floors/<floor>.png` are the drawing areas of the architect's sheets (B1–F17, "STAR HILL – A B C блок план зураг", 2026.05.05), cropped so title blocks, grid dimensions and legends are gone. All eight share one crop (3217 × 1705) so the viewer keeps its shape between floors. To regenerate from a new PDF: `pdftoppm -r 200 -png -x 50 -y 345 -W 3217 -H 1705 plans.pdf out`, then save each page as PNG (palette) over the matching file. They are served unoptimised (small, crisp line art). `public/plans/units/unit-<n>.webp` are the six furnished 3D layouts sliced from the supplied render strip. Unit numbers, room counts and areas are transcribed per floor in `src/lib/floor-plans.ts`; floor names, notes and layout captions live under `plans.` in the message files.

**Brochure** — `public/documents/star-hill-brochure.pdf` (path configurable in `site-config.ts`). It downloads as `STAR-HILL-Brochure.pdf`.

**Logo** — the supplied artboards and Illustrator PDF are kept in `source-media/logo/`. Trimmed web versions live in `public/logo/` and are used by `src/components/ui/Logo.tsx`: `horizontal` (header, end of the film), `stacked` (opening of the film, footer), `monogram` (favicon / app icons: `public/favicon.ico`, `icon.png`, `apple-touch-icon.png`), and `emblem` (the alternate Artboard 1 mark, used only on the 404 page).

## Typography

- **Titles:** handwritten. English uses *Great Vibes*; Mongolian uses *Cormorant Garamond Italic*, because no Google script font contains the Mongolian letters Ө/Ү and a mid-word fallback would look broken. Both are set by the `.title-script` class in `globals.css`.
- **Film statements, sub-titles, lede:** *Playfair Display* (`font-luxe`), a high-contrast serif that echoes the logo lettering.
- **Labels, body, forms:** *Inter*.

## How the cinematic works

`CinematicIntro` (server) checks which media exist and passes localized copy to `CinematicStage` (client).

- The section is `scrollLength` × viewport tall, with a `position: sticky` full-screen stage inside it. When you scroll past the end, the page simply continues. A **Skip intro** link is always available.
- **Loader.** While the film downloads (`data-status="loading"`) a progress line replaces the scroll cue, and the page is held at the top so nobody scrolls past an intro that has not painted yet. The hold is lifted the moment the first frame decodes (or the image fallback kicks in), by **Skip intro**, or after `loaderMaxWaitMs` (10 s) at the latest. It never applies when the page opens on a `#hash` or mid-page. Because the bundle itself can arrive seconds after the HTML on a slow connection, a tiny inline script in `CinematicStage` applies the same hold (`html[data-cine-hold]`, `overflow: hidden`) from the moment the HTML parses, with the same cap; the stage clears it as soon as it takes over. On desktop the progress is the real download (the file is streamed into a blob); on mobile it follows the video's buffered range. On a very slow connection the cap can pass before the film is ready: that is intentional, scrolling is never locked for longer.
- A GSAP `ScrollTrigger` reports progress (0–1). One `requestAnimationFrame` loop eases toward it and drives **everything** from that single value: a paused GSAP timeline (scene text in/out, still crossfades, camera drift), the video's `currentTime`, and the progress counter. Text and video can't drift apart, and React never re-renders while scrolling.
- The video `src` is attached only after mount. On desktop the file is fetched into a blob first, for reliable reverse seeking. It fades in once the first frame decodes. A seek watchdog, `error`/`loadedmetadata` checks, or a missing file switch it to the **image-sequence fallback**: the scene stills crossfade with slow camera moves on the same timeline.
- `prefers-reduced-motion`: no pinning, no video, no scrubbing. Visitors get one still frame with the wordmark and a link into the site.
- States are exposed on the section as `data-status`: `loading | ready | active | completed | fallback | static`.

## Contact form (frontend-only)

- Client-side validation (name, phone and email required). Errors are announced, and focus moves to the first invalid field.
- **Download brochure**: checks the PDF exists (`HEAD`), starts a download on submit, and always shows a direct link. If the PDF is missing, it says so; it never claims success.
- **Request a meeting**: prepares a summary *in the browser only* and states clearly that it **has not been sent**. If `contact.email` / `contact.phone` are configured, the visitor can open their own email app with the request pre-filled, or call.
- Nothing is sent, stored (no local/session storage, no cookies) or logged. Values are cleared after submission, and on `pagehide`.
- Analytics-ready: `src/lib/analytics.ts` dispatches `starhill:analytics` window events (`lead_form_started`, `lead_form_submitted`, `brochure_downloaded`, `meeting_requested`). Payloads are typed so they **cannot** carry personal data. No analytics service is connected.

To make inquiries actually reach the team later, a server endpoint or form service is required. That is intentionally out of scope here.

## Languages

`next-intl` with locale-prefixed routes (`/mn` default, `/en`). Locale detection is off (`localeDetection: false` in `src/i18n/routing.ts`): `/` always opens `/mn`, whatever the browser language or an earlier choice; visitors switch with the MN / EN control. The locale comes from `next/root-params`, compatible with Cache Components. Both pages are statically prerendered. Edit text in `messages/*.json`; the structure must stay identical across both files. The Mongolian copy should be reviewed by a native copywriter before launch.
