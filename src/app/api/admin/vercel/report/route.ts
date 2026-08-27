import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSessionCookie, verifyAdminSession } from "@/lib/admin-auth";

const teamId = "team_2XPDeHUzTlysv1frxqLU9quJ";
const projectId = "prj_4OqK7ILJgKpDRuRfE2vAbilSYEuP";

type VercelAnalyticsResponse = {
  data?: {
    pageviews?: number;
    visitors?: number;
  };
};

export async function GET() {
  if (!verifyAdminSession((await cookies()).get(adminSessionCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const token = process.env.VERCEL_ANALYTICS_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Vercel Analytics is not configured." }, { status: 503 });
  }

  const reportUrl = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
  reportUrl.search = new URLSearchParams({
    projectId,
    since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    teamId,
    until: new Date().toISOString().slice(0, 10),
  }).toString();
  const response = await fetch(reportUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = (await response.json()) as VercelAnalyticsResponse;

  if (!response.ok) {
    console.error("Vercel Analytics report request failed.", result);
    return NextResponse.json({ error: "Unable to load Vercel Analytics." }, { status: 502 });
  }

  return NextResponse.json({
    pageViews: result.data?.pageviews ?? 0,
    visitors: result.data?.visitors ?? 0,
  });
}
