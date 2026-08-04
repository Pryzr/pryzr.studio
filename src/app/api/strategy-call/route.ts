import { Resend } from "resend";
import { NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const { name, email, company, budget, message } = payload as Record<
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

  return NextResponse.json({ calendarUrl });
}
