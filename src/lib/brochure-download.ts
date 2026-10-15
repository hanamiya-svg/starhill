import { siteConfig } from "./site-config";

export type BrochureStatus = "unknown" | "available" | "missing";

/**
 * Verifies that the brochure is actually served as a file (not a 404 page).
 * Uses HEAD so the PDF itself isn't downloaded twice.
 */
export async function checkBrochure(
  url: string = siteConfig.brochure.path,
  signal?: AbortSignal,
): Promise<BrochureStatus> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store", signal });
    if (!res.ok) return "missing";
    const type = res.headers.get("content-type") ?? "";
    // A rewritten/locale-redirected 404 would come back as HTML.
    if (type.includes("text/html")) return "missing";
    return "available";
  } catch {
    return "missing";
  }
}

/**
 * Starts a same-origin download via a temporary anchor. Returns false when the
 * browser environment can't do it, so callers can surface the direct link.
 */
export function triggerBrochureDownload(
  url: string = siteConfig.brochure.path,
  filename: string = siteConfig.brochure.downloadFilename,
): boolean {
  if (typeof document === "undefined") return false;
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return true;
  } catch {
    return false;
  }
}
