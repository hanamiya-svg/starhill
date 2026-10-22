/**
 * The site ships in three designs that share all content (messages, project
 * data, media, intro film). Each lives under its own root layout:
 *   /v1/<locale>  editorial forest & ivory (the original)
 *   /v2/<locale>  architectural grid: paper, ink and cobalt
 *   /v3/<locale>  deep green with the Star Hill script and gold accents
 *   /v4/<locale>  v1 rebuilt around large photography and a shorter page
 */
export const versions = ["v1", "v2", "v3", "v4"] as const;
export type SiteVersion = (typeof versions)[number];
export const defaultVersion: SiteVersion = "v1";

export const isVersion = (v: string | undefined): v is SiteVersion =>
  (versions as readonly string[]).includes(v ?? "");
