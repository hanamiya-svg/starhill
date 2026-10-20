import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { defaultVersion, isVersion } from "./lib/versions";

/**
 * Every page lives at /<version>/<locale>. Anything else is redirected there,
 * always entering in Mongolian (no browser-language detection):
 *   /            → /v1/mn
 *   /en, /mn/…   → /v1/en, /v1/mn/…   (old links keep working)
 *   /v2          → /v2/mn
 *   /v2/xx       → /v2/mn
 */
export function proxy(request: NextRequest) {
  const { pathname, search, hash } = request.nextUrl;
  const [first, second, ...rest] = pathname.split("/").filter(Boolean);
  const locales = routing.locales as readonly string[];
  const fallback = routing.defaultLocale;

  let target: string | null = null;
  if (!first) target = `/${defaultVersion}/${fallback}`;
  else if (locales.includes(first)) target = `/${defaultVersion}/${[first, second, ...rest].filter(Boolean).join("/")}`;
  else if (isVersion(first)) {
    if (!second || !locales.includes(second)) target = `/${first}/${fallback}`;
  } else target = `/${defaultVersion}/${fallback}`;

  if (!target) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = target;
  url.search = search;
  url.hash = hash;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Skip Next internals and any path that looks like a file (images, video, PDF…).
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
