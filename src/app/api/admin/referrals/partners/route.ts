import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminSession, adminSessionCookie } from "@/lib/admin-auth";
import { hashPartnerPassword } from "@/lib/partner-auth";
import {
  createReferralPartner,
  generateTemporaryPassword,
} from "@/lib/referrals";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const session = verifyAdminSession(
    (await cookies()).get(adminSessionCookie)?.value,
  );
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid partner details." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid partner details." }, { status: 400 });
  }

  const { name, email } = payload as Record<string, unknown>;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 120 ||
    !emailPattern.test(email.trim()) ||
    email.trim().length > 254
  ) {
    return NextResponse.json(
      { error: "Enter a name and a valid email address." },
      { status: 400 },
    );
  }

  const temporaryPassword = generateTemporaryPassword();

  try {
    const password = await hashPartnerPassword(temporaryPassword);
    const partner = await createReferralPartner({
      name,
      email,
      passwordSalt: password.salt,
      passwordHash: password.hash,
    });
    return NextResponse.json({ partner, temporaryPassword }, { status: 201 });
  } catch (error) {
    console.error("Could not create referral partner.", error);
    return NextResponse.json(
      { error: "A partner with this email may already exist. Please try again." },
      { status: 409 },
    );
  }
}
