"use client";

import { useEffect, useState } from "react";

type Report = {
  pageViews: number;
};

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
      <div className="mt-6 border border-line bg-background p-4">
        <p className="text-sm text-muted">Page views</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          {error || (report ? report.pageViews : "Loading...")}
        </p>
      </div>
    </section>
  );
}
