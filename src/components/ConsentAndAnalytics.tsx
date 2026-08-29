"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const consentStorageKey = "pryzr-tracking-consent";
const consentCookieName = "pryzr_tracking_consent";
const googleAnalyticsId = "G-QQWH900CZH";
const clarityProjectId = "y8ro7q7kus";
const redditPixelId = "a2_ipmxh3ti5t5m";

export function hasMarketingConsent() {
  return getStoredConsent() === "accepted";
}

function getStoredConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  let value: string | null = null;
  try {
    value = window.localStorage.getItem(consentStorageKey);
  } catch {}

  if (value === "accepted" || value === "rejected") {
    return value;
  }

  const cookieValue =
    document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${consentCookieName}=`))
      ?.split("=")[1] ?? null;
  return cookieValue === "accepted" || cookieValue === "rejected" ? cookieValue : null;
}

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("pryzr-consent-changed", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("pryzr-consent-changed", onStoreChange);
  };
}

function getServerConsent() {
  return null;
}

function appendScript(id: string, source: string) {
  if (document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = source;
  document.head.appendChild(script);
}

function startGoogleAnalytics() {
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const gtag = (...args: unknown[]) => dataLayer.push(args);

  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", googleAnalyticsId, { anonymize_ip: true });
  appendScript("google-analytics", `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`);
}

function startClarity() {
  if (!window.clarity) {
    const clarity = ((...args: unknown[]) => {
      clarity.q.push(args);
    }) as ClarityFunction;
    clarity.q = [];
    window.clarity = clarity;
  }

  window.clarity("consent");
  appendScript("microsoft-clarity", `https://www.clarity.ms/tag/${clarityProjectId}`);
}

function startRedditPixel() {
  if (window.rdt) {
    return;
  }

  const rdt = ((...args: unknown[]) => {
    rdt.queue.push(args);
  }) as ((...args: unknown[]) => void) & { queue: unknown[][] };
  rdt.queue = [];
  window.rdt = rdt;
  appendScript("reddit-pixel", "https://www.redditstatic.com/ads/pixel.js");
  rdt("init", redditPixelId);
  rdt("track", "PageVisit");
}

function startEngagementTracking() {
  const startedAt = Date.now();
  const reachedDepths = new Set<number>();

  const trackDepth = () => {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    const depth = pageHeight > 0 ? Math.round((window.scrollY / pageHeight) * 100) : 100;

    for (const threshold of [25, 50, 75, 100]) {
      if (depth >= threshold && !reachedDepths.has(threshold)) {
        reachedDepths.add(threshold);
        window.gtag?.("event", "scroll_depth", { percent_scrolled: threshold });
      }
    }
  };

  const trackEngagement = () => {
    window.gtag?.("event", "page_engagement", {
      engagement_time_msec: Date.now() - startedAt,
    });
  };

  window.addEventListener("scroll", trackDepth, { passive: true });
  window.addEventListener("pagehide", trackEngagement);
  trackDepth();

  return () => {
    window.removeEventListener("scroll", trackDepth);
    window.removeEventListener("pagehide", trackEngagement);
  };
}

export function CookiePreferencesButton({ locale }: { locale: "en" | "es" }) {
  return (
    <button
      type="button"
      className="underline decoration-accent/50 underline-offset-4 transition-colors hover:text-foreground"
      onClick={() => window.dispatchEvent(new Event("open-cookie-preferences"))}
    >
      {locale === "es" ? "Preferencias de cookies" : "Cookie preferences"}
    </button>
  );
}

export function ConsentAndAnalytics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeToConsent, getStoredConsent, getServerConsent);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener("open-cookie-preferences", openPreferences);
    return () => window.removeEventListener("open-cookie-preferences", openPreferences);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin") || consent !== "accepted") {
      return;
    }

    startGoogleAnalytics();
    startClarity();
    startRedditPixel();
    return startEngagementTracking();
  }, [consent, pathname]);

  function saveConsent(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(consentStorageKey, value);
    } catch {}
    document.cookie = `${consentCookieName}=${value}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`;
    window.dispatchEvent(new Event("pryzr-consent-changed"));
    setPreferencesOpen(false);
  }

  if (pathname.startsWith("/admin") || (consent && !preferencesOpen)) {
    return null;
  }

  return (
    <section
      aria-label="Cookie preferences"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
    >
      <div className="pointer-events-auto w-full max-w-xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Help us improve Pryzr</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Your privacy choices
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Allow optional analytics to help us understand visits, engagement, and advertising performance. We use
          Google Analytics, Microsoft Clarity, and Reddit only with your permission.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-sm border border-line px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent"
            onClick={() => saveConsent("rejected")}
          >
            Reject optional tracking
          </button>
          <button
            type="button"
            className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-white"
            onClick={() => saveConsent("accepted")}
          >
            Allow analytics and advertising
          </button>
        </div>
      </div>
    </section>
  );
}

declare global {
  type ClarityFunction = ((...args: unknown[]) => void) & {
    q: unknown[][];
  };

  interface Window {
    clarity?: ClarityFunction;
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    rdt?: ((...args: unknown[]) => void) & { queue: unknown[][] };
  }
}
