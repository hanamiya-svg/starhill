import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { resolveMedia } from "@/lib/media";
import type { MediaKey } from "@/lib/media-registry";
import { sectionIds } from "@/lib/navigation";
import { GalleryGrid, type GalleryItem } from "./GalleryGrid";

type Category = "exterior" | "aerial" | "landscape" | "street" | "detail";

/** Order and grouping of the gallery. Add/remove entries freely. */
const GALLERY: { key: MediaKey; category: Category }[] = [
  { key: "arch-aerial-pool", category: "aerial" },
  { key: "arch-facade", category: "exterior" },
  { key: "land-street", category: "street" },
  { key: "arch-hillside", category: "exterior" },
  { key: "arch-curved", category: "exterior" },
  { key: "land-public", category: "street" },
  { key: "land-hills", category: "landscape" },
  { key: "arch-sculptural", category: "exterior" },
  { key: "land-garden", category: "landscape" },
  { key: "arch-aerial", category: "aerial" },
  { key: "arch-evening", category: "exterior" },
  { key: "detail-reflection", category: "detail" },
];

export async function ProjectGallery() {
  const t = await getTranslations("gallery");
  const tMedia = await getTranslations("media");

  const items: GalleryItem[] = GALLERY.map(({ key, category }) => ({
    media: resolveMedia(key),
    alt: tMedia(key),
    category: t(`categories.${category}`),
  }));

  return (
    <section
      id={sectionIds.gallery}
      aria-labelledby="gallery-heading"
      data-nav-theme="dark"
      className="bg-obsidian py-section text-ivory"
    >
      <div className="container-editorial">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel index="07" tone="light">
              {t("label")}
            </SectionLabel>
            <SectionHeading id="gallery-heading" className="mt-8">
              {t("heading")}
            </SectionHeading>
          </div>
          <Reveal>
            <p className="label-caps text-ivory/50 tabular-nums">
              {String(items.length).padStart(2, "0")}
            </p>
          </Reveal>
        </div>

        <GalleryGrid
          items={items}
          labels={{
            open: t.raw("open") as string,
            dialog: t("dialog"),
            close: t("close"),
            next: t("next"),
            previous: t("previous"),
            counter: t.raw("counter") as string,
            pending: tMedia("pending"),
          }}
        />
      </div>
    </section>
  );
}
