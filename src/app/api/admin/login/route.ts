import { NextResponse } from "next/server";
import {
  adminSessionCookie,
  adminSessionMaxAge,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  const { username, password } = payload as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  const configuredUsername = await verifyAdminPassword(password);
  if (!configuredUsername || username.trim().toLowerCase() !== configuredUsername.toLowerCase()) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(adminSessionCookie, createAdminSession(configuredUsername), {
    httpOnly: true,
    maxAge: adminSessionMaxAge,
    path: "/",
    sameSite: "lax",
    secure: true,
  });

  return response;
}
