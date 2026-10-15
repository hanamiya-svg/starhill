/**
 * Analytics-ready event hook. No third-party service is integrated.
 *
 * Events are dispatched as a `starhill:analytics` CustomEvent on `window`, so a
 * future analytics integration can subscribe without touching the UI.
 * The payload type deliberately cannot carry personal data — never add
 * name, phone, email or message fields here.
 */
export type AnalyticsEvent =
  | "lead_form_started"
  | "lead_form_submitted"
  | "brochure_downloaded"
  | "meeting_requested";

export type AnalyticsPayload = {
  purpose?: "brochure" | "meeting" | "both";
  locale?: string;
};

export function trackEvent(name: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("starhill:analytics", { detail: { name, ...payload } }),
  );
}
