"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";

const thresholds = [15, 30, 60, 120];

export function VercelEngagementTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      return;
    }

    const reachedThresholds = new Set<number>();
    let accumulatedVisibleTime = 0;
    let visibleSince = document.visibilityState === "visible" ? Date.now() : null;

    const reportMilestones = () => {
      const activeSeconds = Math.floor(
        (accumulatedVisibleTime + (visibleSince ? Date.now() - visibleSince : 0)) / 1000,
      );

      for (const threshold of thresholds) {
        if (activeSeconds >= threshold && !reachedThresholds.has(threshold)) {
          reachedThresholds.add(threshold);
          track(`engaged_${threshold}_seconds`);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        visibleSince = Date.now();
      } else if (visibleSince) {
        accumulatedVisibleTime += Date.now() - visibleSince;
        visibleSince = null;
        reportMilestones();
      }
    };

    const interval = window.setInterval(reportMilestones, 1000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
