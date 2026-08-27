import { createHash, randomUUID } from "crypto";
import { Resend } from "resend";
import { NextResponse } from "next/server";

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

async function trackRedditLead(request: Request, email: string, eventSourceUrl: string) {
  const accessToken = process.env.REDDIT_CONVERSION_ACCESS_TOKEN;

  if (!accessToken) {
    console.error("Strategy-call form is missing Reddit conversion configuration.");
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

  const { name, email, company, budget, message, eventSourceUrl, marketingConsent } = payload as Record<
    string,
    unknown
  >;
  const lead = {
    name: getText(name),
    email: getText(email),
    company: getText(company),
    budget: getText(budget),
    message: getText(message),
  };
  const sourceUrl = getText(eventSourceUrl);

  if (!lead.name || !emailPattern.test(lead.email)) {
    return NextResponse.json(
      { error: "Enter your name and a valid work email." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_FROM_EMAIL;
  const to = process.env.LEAD_TO_EMAIL;
  const calendarUrl = process.env.CALENDLY_EVENT_URL;

  if (!apiKey || !from || !to || !calendarUrl) {
    console.error("Strategy-call form is missing email or calendar configuration.");
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
    subject: `New Pryzr Studio lead: ${lead.name}`,
    html: `
      <h1>New strategy-call request</h1>
      <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(lead.company || "Not provided")}</p>
      <p><strong>Planned investment:</strong> ${escapeHtml(lead.budget || "Not provided")}</p>
      <p><strong>Brand vision:</strong><br>${escapeHtml(lead.message || "Not provided").replace(/\n/g, "<br>")}</p>
    `,
  });

  if (emailResult.error) {
    console.error("Failed to deliver strategy-call lead.", emailResult.error);
    return NextResponse.json(
      { error: "We could not send your request. Please try again." },
      { status: 502 },
    );
  }

  if (marketingConsent === true) {
    await trackRedditLead(request, lead.email, sourceUrl);
  }

  return NextResponse.json({ calendarUrl });
}
