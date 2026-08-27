"use client";

import { useEffect, useState } from "react";

type Report = {
  realtimeActiveUsers?: string;
  rows?: Array<{ metricValues?: Array<{ value?: string }> }>;
};

const metrics = [
  ["Active users", 0],
  ["Sessions", 1],
  ["Page views", 2],
  ["Avg. session", 3],
  ["Events", 4],
  ["Conversions", 5],
  ["Bounce rate", 6],
] as const;

export function GoogleAnalyticsReport() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/google/report")
      .then(async (response) => {
        if (!response.ok) {
          const body: { error?: string } = await response.json();
          throw new Error(body.error ?? "Unable to load Google Analytics.");
        }
        return response.json() as Promise<Report>;
      })
      .then(setReport)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) {
    return (
      <section className="mt-10 border border-line bg-surface p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Google Analytics 4
        </h2>
        <p className="mt-3 text-sm text-muted">{error}</p>
        <a
          className="mt-5 inline-block rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-background"
          href="/api/admin/google/connect"
        >
          Connect Google Analytics
        </a>
      </section>
    );
  }

  const values = report?.rows?.[0]?.metricValues;
  const isLoading = report === null;
  return (
    <section className="mt-10 border border-line bg-surface p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Last 30 days</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Google Analytics 4
          </h2>
        </div>
        <p className="text-sm text-muted">
          Live users: <span className="font-semibold text-foreground">{report?.realtimeActiveUsers ?? "Loading..."}</span>
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, index]) => (
          <div className="border border-line bg-background p-4" key={label}>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              {isLoading
                ? "Loading..."
                : label === "Bounce rate"
                  ? `${Math.round(Number(values?.[index]?.value ?? 0) * 100)}%`
                  : (values?.[index]?.value ?? "0")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
