import { getTranslations } from "next-intl/server";
import { resolveCinematicVideo, resolveMedia } from "@/lib/media";
import { cinematicConfig, type SceneId } from "./cinematic.config";
import { CinematicStage } from "./CinematicStage";

/**
 * Server entry for the opening film: resolves which media actually exist and
 * the localized scene copy, then hands off to the client stage.
 */
export async function CinematicIntro({ nextSectionId }: { nextSectionId: string }) {
  const t = await getTranslations("cinematic");
  const tMedia = await getTranslations("media");

  const lines = Object.fromEntries(
    cinematicConfig.scenes.map((s) => [s.id, t.raw(`scenes.${s.id}.lines`) as string[]]),
  ) as Record<SceneId, string[]>;

  const stills = cinematicConfig.scenes.map((s) => ({
    media: resolveMedia(s.still),
    alt: tMedia(s.still),
  }));

  return (
    <CinematicStage
      nextSectionId={nextSectionId}
      video={resolveCinematicVideo()}
      stills={stills}
      copy={{
        lines,
        wordmark: t("wordmark"),
        wordmarkSub: t("wordmarkSub"),
        cta: t("scenes.reveal.cta"),
        skip: t("skip"),
        scrollHint: t("scrollHint"),
        loading: t("loading"),
        regionLabel: t("regionLabel"),
        pending: tMedia("pending"),
      }}
    />
  );
}
