import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminSessionCookie,
  decryptSecret,
  googleRefreshTokenCookie,
  verifyAdminSession,
} from "@/lib/admin-auth";

type GoogleTokenResponse = {
  access_token?: string;
};

export async function GET() {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(adminSessionCookie)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const refreshToken = decryptSecret(cookieStore.get(googleRefreshTokenCookie)?.value);
  if (!refreshToken) {
    return NextResponse.json({ error: "Google Analytics is not connected." }, { status: 409 });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  if (!clientId || !clientSecret || !propertyId) {
    return NextResponse.json({ error: "Google Analytics is not configured." }, { status: 503 });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const token = (await tokenResponse.json()) as GoogleTokenResponse;
  if (!tokenResponse.ok || !token.access_token) {
    console.error("Google Analytics token refresh failed.", token);
    return NextResponse.json({ error: "Google Analytics authorization expired." }, { status: 502 });
  }

  const reportResponse = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "eventCount" },
          { name: "conversions" },
        ],
      }),
    },
  );
  const report = await reportResponse.json();
  if (!reportResponse.ok) {
    console.error("Google Analytics report request failed.", report);
    return NextResponse.json({ error: "Unable to load Google Analytics." }, { status: 502 });
  }

  return NextResponse.json(report);
}
