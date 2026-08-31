import { NextResponse } from "next/server";
import { partnerSessionCookie } from "@/lib/partner-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/partner/login", request.url));
  response.cookies.set(partnerSessionCookie, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  return response;
}
