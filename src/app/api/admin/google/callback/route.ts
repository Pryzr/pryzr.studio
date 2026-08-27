import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminSessionCookie,
  decryptSecret,
  encryptSecret,
  googleOAuthStateCookie,
  googleRefreshTokenCookie,
  verifyAdminSession,
} from "@/lib/admin-auth";

type GoogleTokenResponse = {
  refresh_token?: string;
};

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = cookieStore.get(googleOAuthStateCookie)?.value;

  if (
    !verifyAdminSession(cookieStore.get(adminSessionCookie)?.value) ||
    !code ||
    !state ||
    state !== expectedState
  ) {
    return NextResponse.redirect(new URL("/admin?google=authorization-failed", request.url));
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/admin?google=not-configured", request.url));
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: new URL("/api/admin/google/callback", request.url).toString(),
    }),
  });

  if (!tokenResponse.ok) {
    console.error("Google OAuth authorization failed.", await tokenResponse.text());
    return NextResponse.redirect(new URL("/admin?google=authorization-failed", request.url));
  }

  const token = (await tokenResponse.json()) as GoogleTokenResponse;
  if (!token.refresh_token) {
    return NextResponse.redirect(new URL("/admin?google=refresh-token-missing", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin?google=connected", request.url));
  response.cookies.set(googleOAuthStateCookie, "", { maxAge: 0, path: "/" });
  response.cookies.set(googleRefreshTokenCookie, encryptSecret(token.refresh_token), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
    sameSite: "strict",
    secure: true,
  });
  return response;
}
