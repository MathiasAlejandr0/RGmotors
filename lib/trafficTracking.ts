export type TrafficSource = {
  source: string; // "Google Ads" | "Facebook" | "Instagram" | "Orgánico" | "Referido" | "Directo"
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  landingPage?: string;
  timestamp?: string;
};

const STORAGE_KEY = "rg_traffic_source";

/**
 * Normaliza y deduce el canal de tráfico a partir de UTMs, clics publicitarios o document.referrer.
 */
export function captureTrafficSource(): TrafficSource {
  if (typeof window === "undefined") {
    return { source: "Directo", medium: "none" };
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source");
    const utmMedium = urlParams.get("utm_medium");
    const utmCampaign = urlParams.get("utm_campaign");
    const utmTerm = urlParams.get("utm_term");
    const utmContent = urlParams.get("utm_content");
    const gclid = urlParams.get("gclid");
    const fbclid = urlParams.get("fbclid");
    const refParam = urlParams.get("ref");

    const ref = document.referrer || "";
    let hostname = "";
    try {
      if (ref) hostname = new URL(ref).hostname.toLowerCase();
    } catch {}

    // Si ya tenemos guardado en sessionStorage y no hay nuevos UTMs en la URL actual, mantener el canal de entrada
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const hasNewTrackingParams = utmSource || gclid || fbclid || refParam;

    if (stored && !hasNewTrackingParams) {
      return JSON.parse(stored);
    }

    let source = "Directo";
    let medium = "none";
    let campaign = utmCampaign || undefined;

    if (utmSource) {
      const s = utmSource.toLowerCase();
      if (s.includes("google")) source = "Google Ads";
      else if (s.includes("instagram") || s.includes("ig")) source = "Instagram";
      else if (s.includes("facebook") || s.includes("fb") || s.includes("meta")) source = "Facebook";
      else if (s.includes("tiktok")) source = "TikTok";
      else if (s.includes("refer") || s.includes("alianza")) source = "Referido";
      else source = utmSource;
      medium = utmMedium || "cpc";
    } else if (gclid) {
      source = "Google Ads";
      medium = "cpc";
      campaign = campaign || "Google Search Ads";
    } else if (fbclid) {
      source = "Facebook";
      medium = "paid";
      campaign = campaign || "Meta Ads Campaign";
    } else if (refParam) {
      source = `Referido (${refParam})`;
      medium = "referral";
    } else if (hostname) {
      if (hostname.includes("instagram.com")) {
        source = "Instagram";
        medium = "social";
      } else if (hostname.includes("facebook.com") || hostname.includes("fb.me")) {
        source = "Facebook";
        medium = "social";
      } else if (hostname.includes("google.")) {
        source = "Orgánico";
        medium = "organic";
      } else if (hostname.includes("chileautos.cl")) {
        source = "Referido (Chileautos)";
        medium = "referral";
      } else if (hostname.includes("autofact.cl")) {
        source = "Referido (Autofact)";
        medium = "referral";
      } else if (!hostname.includes(window.location.hostname)) {
        source = `Referido (${hostname.replace(/^www\./, "")})`;
        medium = "referral";
      }
    }

    const trafficData: TrafficSource = {
      source,
      medium: utmMedium || medium,
      campaign,
      term: utmTerm || undefined,
      content: utmContent || undefined,
      referrer: ref || undefined,
      landingPage: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trafficData));
    return trafficData;
  } catch {
    return { source: "Directo", medium: "none" };
  }
}

/**
 * Obtiene la fuente de tráfico de la sesión actual para adjuntarla en cualquier formulario / API.
 */
export function getTrafficSource(): TrafficSource {
  if (typeof window === "undefined") {
    return { source: "Directo", medium: "none" };
  }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return captureTrafficSource();
  } catch {
    return { source: "Directo", medium: "none" };
  }
}
