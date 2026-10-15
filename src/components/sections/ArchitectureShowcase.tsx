import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { ImageReveal, InkReveal, Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import type { MediaKey } from "@/lib/media-registry";
import { sectionIds } from "@/lib/navigation";

type Item = "sculptural" | "glass" | "light" | "detail";

function Caption({ index, title, caption, className }: { index: string; title: string; caption: string; className?: string }) {
  return (
    <figcaption className={`mt-6 ${className ?? ""}`}>
      <Reveal delay={0.6} y={20} className="grid grid-cols-[2.5rem_1fr] gap-x-4">
        <span className="label-caps pt-1.5 text-gold-deep tabular-nums">{index}</span>
        <span>
          <span className="block font-luxe text-xl leading-snug md:text-2xl">{title}</span>
          <span className="mt-2 block max-w-sm text-sm leading-relaxed text-ink-muted">{caption}</span>
        </span>
      </Reveal>
    </figcaption>
  );
}

export async function ArchitectureShowcase() {
  const t = await getTranslations("architecture");
  const tMedia = await getTranslations("media");
  const pending = tMedia("pending");

  const frame = (key: MediaKey, sizes: string, className: string, from?: "bottom" | "left" | "right") => {
    const media = resolveMedia(key);
    return (
      <ImageReveal className={`group ${className}`} from={from} delay={0.05}>
        <MediaFrame
          media={media}
          alt={tMedia(key)}
          pendingLabel={pending}
          sizes={sizes}
          className="h-full w-full"
          imageClassName="transition-transform duration-[1.6s] ease-[var(--ease-out)] group-hover:scale-[1.03]"
        />
      </ImageReveal>
    );
  };
  const item = (k: Item) => ({ title: t(`items.${k}.title`), caption: t(`items.${k}.caption`) });

  return (
    <section
      id={sectionIds.architecture}
      aria-labelledby="architecture-heading"
      data-nav-theme="light"
      className="bg-white py-section"
    >
      <div className="container-editorial">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <SectionLabel index="02">{t("label")}</SectionLabel>
            <SectionHeading id="architecture-heading" className="mt-8 max-w-[16ch]">
              {t("heading")}
            </SectionHeading>
          </div>
          <Reveal className="self-end md:col-span-4 md:col-start-9" delay={0.5}>
            <p className="text-[0.9375rem] leading-[1.8] text-ink-muted">{t("lede")}</p>
          </Reveal>
        </div>

        {/* Asymmetric composition — deliberately not a uniform card grid. */}
        <div className="mt-20 grid gap-y-20 md:mt-28 md:grid-cols-12 md:gap-x-8 md:gap-y-32">
          <figure className="md:col-span-5">
            {frame("arch-sculptural", "(min-width: 768px) 40vw, 100vw", "aspect-[3/4]")}
            <Caption index="2.1" {...item("sculptural")} />
          </figure>

          <figure className="md:col-span-6 md:col-start-7 md:mt-48">
            {frame("arch-facade", "(min-width: 768px) 48vw, 100vw", "aspect-[4/5]", "right")}
            <Caption index="2.2" {...item("glass")} />
          </figure>

          <figure className="-mx-gutter md:col-span-12 md:mx-0">
            {frame("arch-evening", "100vw", "aspect-[4/3] md:aspect-[21/9]")}
            <Caption index="2.3" {...item("light")} className="px-gutter md:ml-auto md:max-w-md md:px-0" />
          </figure>

          <figure className="md:col-span-4 md:col-start-2">
            {frame("detail-reflection", "(min-width: 768px) 32vw, 100vw", "aspect-square", "left")}
            <Caption index="2.4" {...item("detail")} />
          </figure>
          <div className="hidden md:col-span-5 md:col-start-7 md:flex md:items-end">
            <InkReveal delay={0.3}>
              <p className="font-luxe text-[clamp(1.4rem,2.1vw,2rem)] leading-[1.4] text-ink/85 italic">{t("quote")}</p>
            </InkReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
