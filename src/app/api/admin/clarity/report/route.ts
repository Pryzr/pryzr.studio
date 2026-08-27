import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { adminSessionCookie, verifyAdminSession } from "@/lib/admin-auth";

const clarityProjectId = "y8ro7q7kus";

type ClarityMetric = {
  information: Array<Record<string, number | null>>;
  metricName: string;
};

function getMetricValue(metrics: ClarityMetric[], metricName: string, field: string) {
  const value = metrics.find((metric) => metric.metricName === metricName)?.information[0]?.[field];
  return typeof value === "number" ? value : 0;
}

function isClarityMetric(value: unknown): value is ClarityMetric {
  return (
    typeof value === "object" &&
    value !== null &&
    "metricName" in value &&
    "information" in value &&
    typeof value.metricName === "string" &&
    Array.isArray(value.information)
  );
}

async function loadClarityReport() {
  const token = process.env.CLARITY_API_TOKEN;
  if (!token) {
    throw new Error("Microsoft Clarity is not configured.");
  }

  const reportUrl = new URL("https://www.clarity.ms/export-data/api/v1/project-live-insights");
  reportUrl.search = new URLSearchParams({
    numOfDays: "3",
    projectId: clarityProjectId,
  }).toString();
  const response = await fetch(reportUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? "Microsoft Clarity's daily Data Export limit has been reached. Try again tomorrow."
        : `Microsoft Clarity request failed with status ${response.status}.`,
    );
  }

  if (!responseText) {
    throw new Error("Microsoft Clarity returned no report data.");
  }

  const parsed: unknown = JSON.parse(responseText);
  if (!Array.isArray(parsed) || !parsed.every(isClarityMetric)) {
    throw new Error("Microsoft Clarity returned an invalid report.");
  }
  const metrics = parsed;

  return {
    active_time: getMetricValue(metrics, "EngagementTime", "activeTime"),
    dead_clicks: getMetricValue(metrics, "DeadClickCount", "sessionsCount"),
    pages_per_session: getMetricValue(metrics, "Traffic", "pagesPerSessionPercentage"),
    rage_clicks: getMetricValue(metrics, "RageClickCount", "sessionsCount"),
    scroll_depth: getMetricValue(metrics, "ScrollDepth", "averageScrollDepth"),
    sessions: getMetricValue(metrics, "Traffic", "totalSessionCount"),
  };
}

const getClarityReport = unstable_cache(loadClarityReport, ["clarity-live-insights"], {
  revalidate: 3600,
});

export async function GET() {
  if (!verifyAdminSession((await cookies()).get(adminSessionCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    return NextResponse.json(await getClarityReport());
  } catch (error) {
    console.error("Microsoft Clarity report request failed.", error);
    const message =
      error instanceof Error ? error.message : "Unable to load Microsoft Clarity.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
