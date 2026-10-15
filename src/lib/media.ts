import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cinematicConfig } from "@/components/cinematic/cinematic.config";
import { mediaRegistry, type MediaKey, type ResolvedMedia } from "./media-registry";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".webp", ".avif", ".png"];

function findPublicFile(base: string, extensions = IMAGE_EXTENSIONS): string | null {
  for (const ext of extensions) {
    const rel = `${base}${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return rel;
  }
  return null;
}

export function resolveMedia(key: MediaKey): ResolvedMedia {
  const entry = mediaRegistry[key];
  return {
    key,
    src: findPublicFile(entry.file),
    expected: `public${entry.file}.jpg`,
    art: entry.art,
    focus: entry.focus,
  };
}

/** Cinematic video sources — only returned when the files actually exist. */
export function resolveCinematicVideo() {
  const { src, mobileSrc, poster: posterBase } = cinematicConfig.video;
  const desktop = findPublicFile(src, [".mp4"]);
  const mobile = findPublicFile(mobileSrc, [".mp4"]);
  const poster = findPublicFile(posterBase);
  return { desktop, mobile: mobile ?? desktop, poster };
}

export function fileExistsInPublic(publicPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", publicPath));
}
