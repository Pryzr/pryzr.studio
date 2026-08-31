import { NextResponse } from "next/server";
import {
  findReferralPartnerByCode,
  referralAttributionCookie,
} from "@/lib/referrals";

const referralCookieMaxAge = 60 * 60 * 24 * 90;

export async function GET(
  request: Request,
  { params }: RouteContext<"/r/[code]">,
) {
  const { code } = await params;
  const destination = new URL("/", request.url);

  try {
    const partner = await findReferralPartnerByCode(code);
    const response = NextResponse.redirect(destination);

    if (partner) {
      response.cookies.set(referralAttributionCookie, partner.referral_code, {
        httpOnly: true,
        maxAge: referralCookieMaxAge,
        path: "/",
        sameSite: "lax",
        secure: true,
      });
    }

    return response;
  } catch (error) {
    console.error("Referral attribution could not be recorded.", error);
    return NextResponse.redirect(destination);
  }
}
