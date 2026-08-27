import { NextResponse } from "next/server";
import {
  adminSessionCookie,
  googleRefreshTokenCookie,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.set(adminSessionCookie, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    secure: true,
  });
  response.cookies.set(googleRefreshTokenCookie, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    secure: true,
  });

  return response;
}
