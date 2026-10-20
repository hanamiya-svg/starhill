import { getTranslations } from "next-intl/server";
import { CinematicIntro } from "@/components/cinematic/CinematicIntro";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { V3Plans } from "@/components/v3/V3Plans";
import { V3Residences } from "@/components/v3/V3Residences";
import {
  V3Amenities,
  V3Architecture,
  V3Contact,
  V3Financing,
  V3Intro,
  V3Location,
  V3Overview,
  V3Setting,
} from "@/components/v3/V3Sections";
import { resolveMedia } from "@/lib/media";
import { sectionIds } from "@/lib/navigation";
import { siteConfig } from "@/lib/site-config";

/** v3 order: film → setting → introduction → amenities → location → architecture → residences → plans → financing → overview → contact. */
export default async function V3Page() {
  const t = await getTranslations("residences");
  const tm = await getTranslations("media");
  const photos = Object.fromEntries(
    siteConfig.residences.map((r) => [
      r.id,
      <MediaFrame key={r.id} media={resolveMedia(r.image)} alt={tm(r.image)} pendingLabel={tm("pending")} sizes="(min-width: 768px) 45vw, 100vw" className="h-full w-full" />,
    ]),
  );
  const { residenceSummary } = siteConfig;

  return (
    <main id="top">
      <CinematicIntro nextSectionId={sectionIds.nature} look="v3" />
      <V3Setting />
      <V3Intro />
      <V3Amenities />
      <V3Location />
      <V3Architecture />
      <V3Residences photos={photos} intro={t("intro", { rooms: residenceSummary.rooms, area: residenceSummary.area })} />
      <V3Plans />
      <V3Financing />
      <V3Overview />
      <V3Contact />
    </main>
  );
}
