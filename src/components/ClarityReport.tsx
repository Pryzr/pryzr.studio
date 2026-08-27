"use client";

import { useEffect, useState } from "react";

type ClarityReportData = Record<string, number | string>;

const metrics = [
  ["Sessions", "sessions"],
  ["Pages per session", "pages_per_session"],
  ["Active time", "active_time"],
  ["Scroll depth", "scroll_depth"],
  ["Rage clicks", "rage_clicks"],
  ["Dead clicks", "dead_clicks"],
] as const;

export function ClarityReport() {
  const [report, setReport] = useState<ClarityReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/clarity/report")
      .then(async (response) => {
        if (!response.ok) {
          const body: { error?: string } = await response.json();
          throw new Error(body.error ?? "Unable to load Microsoft Clarity.");
        }
        return response.json() as Promise<ClarityReportData>;
      })
      .then(setReport)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) {
    return (
      <section className="mt-10 border border-line bg-surface p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Microsoft Clarity
        </h2>
        <p className="mt-3 text-sm text-muted">{error}</p>
      </section>
    );
  }

  return (
    <section className="mt-10 border border-line bg-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Last 3 days</p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
        Microsoft Clarity
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, key]) => (
          <div className="border border-line bg-background p-4" key={key}>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              {report ? (report[key] ?? "0") : "Loading..."}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
