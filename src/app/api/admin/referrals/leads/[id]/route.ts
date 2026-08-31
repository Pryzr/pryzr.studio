import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminSessionCookie, verifyAdminSession } from "@/lib/admin-auth";
import {
  isValidReferralStatus,
  updateReferralLeadStatus,
} from "@/lib/referrals";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/admin/referrals/leads/[id]">,
) {
  const session = verifyAdminSession(
    (await cookies()).get(adminSessionCookie)?.value,
  );
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!uuidPattern.test(id)) {
    return NextResponse.json({ error: "Invalid referral." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid referral status." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid referral status." }, { status: 400 });
  }

  const { status } = payload as Record<string, unknown>;
  if (!isValidReferralStatus(status)) {
    return NextResponse.json({ error: "Invalid referral status." }, { status: 400 });
  }

  try {
    const lead = await updateReferralLeadStatus(id, status);
    if (!lead) {
      return NextResponse.json({ error: "Referral not found." }, { status: 404 });
    }
    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Could not update referral status.", error);
    return NextResponse.json(
      { error: "Unable to update referral status. Please try again." },
      { status: 503 },
    );
  }
}
