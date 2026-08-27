"use client";

import { useEffect, useState } from "react";

const consentStorageKey = "pryzr-tracking-consent";
const googleAnalyticsId = "G-QQWH900CZH";
const clarityProjectId = "y8ro7q7kus";
const redditPixelId = "a2_ipmxh3ti5t5m";

export function hasMarketingConsent() {
  return window.localStorage.getItem(consentStorageKey) === "accepted";
}

function getStoredConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(consentStorageKey);
  return value === "accepted" || value === "rejected" ? value : null;
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
  window.clarity =
    window.clarity ||
    ((...args: unknown[]) => {
      window.clarityQueue = window.clarityQueue || [];
      window.clarityQueue.push(args);
    });
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
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(getStoredConsent);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const openPreferences = () => setPreferencesOpen(true);
    window.addEventListener("open-cookie-preferences", openPreferences);
    return () => window.removeEventListener("open-cookie-preferences", openPreferences);
  }, []);

  useEffect(() => {
    if (consent !== "accepted") {
      return;
    }

    startGoogleAnalytics();
    startClarity();
    startRedditPixel();
    return startEngagementTracking();
  }, [consent]);

  function saveConsent(value: "accepted" | "rejected") {
    window.localStorage.setItem(consentStorageKey, value);
    setConsent(value);
    setPreferencesOpen(false);
  }

  if (consent && !preferencesOpen) {
    return null;
  }

  return (
    <section
      aria-label="Cookie preferences"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl border border-line bg-surface p-5 shadow-2xl md:inset-x-8"
    >
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
        Your privacy choices
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        With your permission, we use Google Analytics, Microsoft Clarity, and Reddit to understand visits,
        engagement, location at a broad level, and advertising performance.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
          Accept analytics and advertising
        </button>
      </div>
    </section>
  );
}

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    clarityQueue?: unknown[][];
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    rdt?: ((...args: unknown[]) => void) & { queue: unknown[][] };
  }
}
