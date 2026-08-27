import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSessionCookie, verifyAdminSession } from "@/lib/admin-auth";

const clarityProjectId = "y8ro7q7kus";

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
    numOfDays: "30",
    projectId: clarityProjectId,
  }).toString();
  const response = await fetch(reportUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const report = await response.json();

  if (!response.ok) {
    console.error("Microsoft Clarity report request failed.", report);
    return NextResponse.json({ error: "Unable to load Microsoft Clarity." }, { status: 502 });
  }

  return NextResponse.json(report);
}
