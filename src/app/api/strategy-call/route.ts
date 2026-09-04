import { createHash, randomUUID } from "crypto";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import {
  createReferralLead,
  findReferralPartnerByCode,
  referralAttributionCookie,
} from "@/lib/referrals";
import {
  normalizeInternationalPhone,
  parseSmsConsent,
  smsConsentDisclosureVersion,
} from "@/lib/lead";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const redditPixelId = "a2_ipmxh3ti5t5m";

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

function hashEmail(email: string) {
  const [local, domain] = email.toLowerCase().split("@");
  const normalized = `${local.replace(/\./g, "").split("+")[0]}@${domain}`;

  return createHash("sha256").update(normalized).digest("hex");
}

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  const value = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);

  return value ? decodeURIComponent(value) : undefined;
}

function getSafeEventSourceUrl(request: Request, submittedUrl: unknown) {
  const requestUrl = new URL(request.url);
  const candidate = getText(submittedUrl);
  try {
    const parsed = new URL(candidate);
    if (parsed.origin === requestUrl.origin) {
      return `${parsed.origin}${parsed.pathname}`;
    }
  } catch {
    // Fall back to the request origin without reflecting submitted data.
  }
  return requestUrl.origin;
}

async function trackRedditLead(
  request: Request,
  email: string,
  eventSourceUrl: string,
) {
  const accessToken = process.env.REDDIT_CONVERSION_ACCESS_TOKEN;

  if (!accessToken) {
    console.error(
      "Strategy-call form is missing Reddit conversion configuration.",
    );
    return;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent");
  const redditUuid = getCookie(request, "rdt_uuid");

  try {
    const response = await fetch(
      `https://ads-api.reddit.com/api/v3/pixels/${redditPixelId}/conversion_events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "User-Agent": "web:pryzr-studio-capi:v1.0.0",
        },
        body: JSON.stringify({
          data: {
            events: [
              {
                event_at: Date.now(),
                action_source: "WEBSITE",
                event_source_url: eventSourceUrl,
                type: { tracking_type: "LEAD" },
                metadata: { conversion_id: randomUUID() },
                user: {
                  email: hashEmail(email),
                  ...(ipAddress ? { ip_address: ipAddress } : {}),
                  ...(userAgent ? { user_agent: userAgent } : {}),
                  ...(redditUuid ? { uuid: redditUuid } : {}),
                },
              },
            ],
          },
        }),
      },
    );

    if (!response.ok) {
      console.error(
        `Reddit lead conversion failed with status ${response.status}.`,
        await response.text(),
      );
    }
  } catch (error) {
    console.error("Reddit lead conversion request failed.", error);
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const {
    name,
    email,
    phone,
    locale,
    smsConsent,
    smsConsentDisclosureVersion: submittedDisclosureVersion,
    inquiryType: submittedInquiryType,
    launchTiming,
    eventSourceUrl,
  } = payload as Record<string, unknown>;
  const inquiryType: "call" | "overview" =
    getText(submittedInquiryType) === "overview" ? "overview" : "call";
  const lead: {
    name: string;
    email: string;
    inquiryType: "call" | "overview";
    launchTiming: string;
    phone: string;
    smsConsent: boolean;
    smsConsentAt: string | null;
    smsConsentDisclosureVersion: string;
  } = {
    name: getText(name),
    email: getText(email),
    inquiryType,
    launchTiming: getText(launchTiming),
    phone: normalizeInternationalPhone(phone) ?? "",
    smsConsent: parseSmsConsent(smsConsent),
    smsConsentAt: null,
    smsConsentDisclosureVersion,
  };
  if (lead.smsConsent) {
    lead.smsConsentAt = new Date().toISOString();
  }
  const sourceUrl = getSafeEventSourceUrl(request, eventSourceUrl);
  const isSpanish = getText(locale) === "es";

  if (
    !lead.name ||
    !emailPattern.test(lead.email) ||
    !lead.launchTiming ||
    !lead.phone
  ) {
    return NextResponse.json(
      {
        error: isSpanish
          ? "Ingresa tu nombre, un email de trabajo válido, un número móvil internacional y el plazo de lanzamiento."
          : "Enter your name, a valid work email, an international mobile number, and launch timing.",
      },
      { status: 400 },
    );
  }

  if (getText(submittedDisclosureVersion) !== smsConsentDisclosureVersion) {
    return NextResponse.json(
      {
        error: isSpanish
          ? "Actualiza la página y vuelve a enviarla."
          : "Please refresh the page and submit again.",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM_EMAIL;
  const to = process.env.LEAD_TO_EMAIL;
  const calendarUrl = process.env.CALENDLY_EVENT_URL;

  if (!apiKey || !from || !to || !calendarUrl) {
    console.error(
      "Strategy-call form is missing email or calendar configuration.",
    );
    return NextResponse.json(
      { error: "The strategy-call form is temporarily unavailable." },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const emailResult = await resend.emails.send({
    from,
    to,
    replyTo: lead.email,
    subject: `New Pryzr Studio ${lead.inquiryType === "overview" ? "overview request" : "strategy-call lead"}: ${lead.name}`,
    html: `
      <h1>New Pryzr Studio ${lead.inquiryType === "overview" ? "launch-readiness overview request" : "strategy-call request"}</h1>
      <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      <p><strong>Mobile phone:</strong> ${escapeHtml(lead.phone)}</p>
      <p><strong>Launch timing:</strong> ${escapeHtml(lead.launchTiming)}</p>
      <p><strong>SMS consent:</strong> ${lead.smsConsent ? "Yes" : "No"}</p>
      <p><strong>SMS consent timestamp:</strong> ${lead.smsConsentAt ? escapeHtml(lead.smsConsentAt) : "Not applicable"}</p>
      <p><strong>SMS disclosure version:</strong> ${escapeHtml(lead.smsConsentDisclosureVersion)}</p>
    `,
  });

  if (emailResult.error) {
    console.error("Failed to deliver strategy-call lead.", emailResult.error);
    return NextResponse.json(
      { error: "We could not send your request. Please try again." },
      { status: 502 },
    );
  }

  await trackRedditLead(request, lead.email, sourceUrl);

  const referralCode = getCookie(request, referralAttributionCookie);
  if (referralCode) {
    try {
      const partner = await findReferralPartnerByCode(referralCode);
      if (partner) {
        await createReferralLead({
          partnerId: partner.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          launchTiming: lead.launchTiming,
          inquiryType: lead.inquiryType,
          smsConsent: lead.smsConsent,
          smsConsentAt: lead.smsConsentAt,
          smsConsentDisclosureVersion: lead.smsConsentDisclosureVersion,
        });
      }
    } catch (error) {
      console.error("Could not save referral attribution for lead.", error);
      return NextResponse.json(
        {
          error:
            "We could not complete your referral submission. Please contact us directly so we can help.",
        },
        { status: 503 },
      );
    }
  }

  return NextResponse.json(
    lead.inquiryType === "overview" ? { submitted: true } : { calendarUrl },
  );
}
