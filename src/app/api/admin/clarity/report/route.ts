import { cookies } from "next/headers";
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

export async function GET() {
  if (!verifyAdminSession((await cookies()).get(adminSessionCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = process.env.CLARITY_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Microsoft Clarity is not configured." }, { status: 503 });
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
    console.error(
      `Microsoft Clarity report request failed with status ${response.status}.`,
      responseText,
    );
    return NextResponse.json({ error: "Unable to load Microsoft Clarity." }, { status: 502 });
  }

  if (!responseText) {
    console.error("Microsoft Clarity report request returned an empty response.");
    return NextResponse.json({ error: "Microsoft Clarity returned no report data." }, { status: 502 });
  }

  let metrics: ClarityMetric[];
  try {
    const parsed: unknown = JSON.parse(responseText);
    if (!Array.isArray(parsed) || !parsed.every(isClarityMetric)) {
      throw new Error("Expected an array of metrics.");
    }
    metrics = parsed;
  } catch (error) {
    console.error("Microsoft Clarity report has an unexpected format.", error);
    return NextResponse.json({ error: "Microsoft Clarity returned an invalid report." }, { status: 502 });
  }

  return NextResponse.json({
    active_time: getMetricValue(metrics, "EngagementTime", "activeTime"),
    dead_clicks: getMetricValue(metrics, "DeadClickCount", "sessionsCount"),
    pages_per_session: getMetricValue(metrics, "Traffic", "pagesPerSessionPercentage"),
    rage_clicks: getMetricValue(metrics, "RageClickCount", "sessionsCount"),
    scroll_depth: getMetricValue(metrics, "ScrollDepth", "averageScrollDepth"),
    sessions: getMetricValue(metrics, "Traffic", "totalSessionCount"),
  });
}
