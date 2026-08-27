"use client";

import { useEffect, useState } from "react";

type Report = {
  engaged15Seconds: number;
  engaged30Seconds: number;
  engaged60Seconds: number;
  engaged120Seconds: number;
  pageViews: number;
  visitors: number;
};

const engagementMetrics = [
  { label: "Active 15 seconds", key: "engaged15Seconds" },
  { label: "Active 30 seconds", key: "engaged30Seconds" },
  { label: "Active 60 seconds", key: "engaged60Seconds" },
  { label: "Active 2 minutes", key: "engaged120Seconds" },
] as const;

export function VercelAnalyticsReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/vercel/report")
      .then(async (response) => {
        if (!response.ok) {
          const body: { error?: string } = await response.json();
          throw new Error(body.error ?? "Unable to load Vercel Analytics.");
        }
        return response.json() as Promise<Report>;
      })
      .then(setReport)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  return (
    <section className="mt-10 border border-line bg-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Last 30 days</p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
        Vercel Web Analytics
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border border-line bg-background p-4">
          <p className="text-sm text-muted">Visitors</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            {error || (report ? report.visitors : "Loading...")}
          </p>
        </div>
        <div className="border border-line bg-background p-4">
          <p className="text-sm text-muted">Page views</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            {error || (report ? report.pageViews : "Loading...")}
          </p>
        </div>
        {engagementMetrics.map((metric) => (
          <div className="border border-line bg-background p-4" key={metric.key}>
            <p className="text-sm text-muted">{metric.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              {error || (report ? report[metric.key] : "Loading...")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
