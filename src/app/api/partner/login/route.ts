import { NextResponse } from "next/server";
import {
  createPartnerSession,
  partnerSessionCookie,
  partnerSessionMaxAge,
  verifyPartnerPassword,
} from "@/lib/partner-auth";
import { findReferralPartnerForAuthentication } from "@/lib/referrals";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fallbackPasswordSalt = "c896112b7bb6d11bb8e1013beb36cf48";
const fallbackPasswordHash =
  "bddd17d7c64e12b55a2d4bb3a232a3fa3b5dcbf6e51d9c170f96d6618c5a4eb7eea8df2f489105a61b443e528943c270d35a653d18b15bcd05eabcf3ad73a135";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid sign-in request." }, { status: 400 });
  }

  const { email, password } = payload as Record<string, unknown>;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !emailPattern.test(email.trim()) ||
    password.length === 0
  ) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  try {
    const partner = await findReferralPartnerForAuthentication(email);
    const isValid = await verifyPartnerPassword(
      password,
      partner?.password_salt ?? fallbackPasswordSalt,
      partner?.password_hash ?? fallbackPasswordHash,
    );

    if (!partner || !isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(partnerSessionCookie, createPartnerSession(partner.id), {
      httpOnly: true,
      maxAge: partnerSessionMaxAge,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
    return response;
  } catch (error) {
    console.error("Partner sign-in failed.", error);
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
}
