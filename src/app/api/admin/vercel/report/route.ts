import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSessionCookie, verifyAdminSession } from "@/lib/admin-auth";

const teamId = "team_2XPDeHUzTlysv1frxqLU9quJ";
const projectId = "prj_4OqK7ILJgKpDRuRfE2vAbilSYEuP";

type VercelAnalyticsResponse = {
  data?: {
    count?: number;
    pageviews?: number;
    visitors?: number;
  };
};

const engagementEvents = [15, 30, 60, 120];

export async function GET() {
  if (!verifyAdminSession((await cookies()).get(adminSessionCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = process.env.VERCEL_ANALYTICS_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Vercel Analytics is not configured." }, { status: 503 });
  }

  const query = new URLSearchParams({
    projectId,
    since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    teamId,
    until: new Date().toISOString().slice(0, 10),
  });
  const loadReport = async (path: string, filter?: string) => {
    const reportUrl = new URL(`https://api.vercel.com${path}`);
    const search = new URLSearchParams(query);
    if (filter) {
      search.set("filter", filter);
    }
    reportUrl.search = search.toString();

    const response = await fetch(reportUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = (await response.json()) as VercelAnalyticsResponse;
    if (!response.ok) {
      throw new Error(`Vercel Analytics request failed with status ${response.status}.`);
    }
    return result;
  };

  try {
    const [visits, ...engagement] = await Promise.all([
      loadReport("/v1/query/web-analytics/visits/count"),
      ...engagementEvents.map((seconds) =>
        loadReport(
          "/v1/query/web-analytics/events/count",
          `eventName eq 'engaged_${seconds}_seconds'`,
        ),
      ),
    ]);

    return NextResponse.json({
      engaged15Seconds: engagement[0].data?.count ?? 0,
      engaged30Seconds: engagement[1].data?.count ?? 0,
      engaged60Seconds: engagement[2].data?.count ?? 0,
      engaged120Seconds: engagement[3].data?.count ?? 0,
      pageViews: visits.data?.pageviews ?? 0,
      visitors: visits.data?.visitors ?? 0,
    });
  } catch (error) {
    console.error("Vercel Analytics report request failed.", error);
    return NextResponse.json({ error: "Unable to load Vercel Analytics." }, { status: 502 });
  }
}
