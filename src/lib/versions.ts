/**
 * The site ships in three designs that share all content (messages, project
 * data, media, intro film). Each lives under its own root layout:
 *   /v1/<locale>  editorial forest & ivory (the original)
 *   /v2/<locale>  architectural grid: paper, ink and cobalt
 *   /v3/<locale>  warm terrace: sand, terracotta and olive, soft cards
 */
export const versions = ["v1", "v2", "v3"] as const;
export type SiteVersion = (typeof versions)[number];
export const defaultVersion: SiteVersion = "v1";

export const isVersion = (v: string | undefined): v is SiteVersion =>
  (versions as readonly string[]).includes(v ?? "");
