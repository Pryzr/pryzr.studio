import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  adminSessionCookie,
  googleOAuthStateCookie,
  verifyAdminSession,
} from "@/lib/admin-auth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(adminSessionCookie)?.value)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/admin?google=not-configured", request.url));
  }

  const state = randomBytes(32).toString("base64url");
  const redirectUri = new URL("/api/admin/google/callback", request.url).toString();
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.search = new URLSearchParams({
    access_type: "offline",
    client_id: clientId,
    include_granted_scopes: "true",
    prompt: "consent",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    state,
  }).toString();

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(googleOAuthStateCookie, state, {
    httpOnly: true,
    maxAge: 600,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  return response;
}
