import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next internals and any path that looks like a file (images, video, PDF…).
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
