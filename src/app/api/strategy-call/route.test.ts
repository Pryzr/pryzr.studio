import { beforeEach, describe, expect, it, vi } from "vitest";
import { smsConsentDisclosureVersion } from "@/lib/lead";

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn(),
  findPartner: vi.fn(),
  createLead: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.sendEmail };
  },
}));

vi.mock("@/lib/referrals", () => ({
  referralAttributionCookie: "pryzr_referral_code",
  findReferralPartnerByCode: mocks.findPartner,
  createReferralLead: mocks.createLead,
}));

import { POST } from "@/app/api/strategy-call/route";

function request(body: Record<string, unknown>, cookie?: string) {
  return new Request("https://pryzr.studio/api/strategy-call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "+44 20 7946 0958",
      launchTiming: "1-3 months",
      inquiryType: "call",
      smsConsent: false,
      smsConsentDisclosureVersion,
      eventSourceUrl: "https://pryzr.studio/#contact",
      ...body,
    }),
  });
}

describe("POST /api/strategy-call", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    process.env.LEAD_FROM_EMAIL = "leads@pryzr.studio";
    process.env.LEAD_TO_EMAIL = "owner@example.com";
    process.env.CALENDLY_EVENT_URL = "https://calendly.com/pryzr/event";
    process.env.REDDIT_CONVERSION_ACCESS_TOKEN = "reddit-test-key";
    mocks.sendEmail.mockResolvedValue({
      data: { id: "email-id" },
      error: null,
    });
    mocks.findPartner.mockResolvedValue({ id: "partner-id" });
    mocks.createLead.mockResolvedValue({ id: "lead-id" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("{}", { status: 200 }),
    );
  });

  it("normalizes phone, records explicit false consent, and preserves the Calendly response", async () => {
    const response = await POST(request({}));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      calendarUrl: "https://calendly.com/pryzr/event",
    });
    const message = mocks.sendEmail.mock.calls[0][0];
    expect(message.html).toContain("+442079460958");
    expect(message.html).toContain("SMS consent:</strong> No");
    expect(message.html).toContain(
      "SMS consent timestamp:</strong> Not applicable",
    );
    expect(message.html).toContain(smsConsentDisclosureVersion);
    expect(
      JSON.stringify((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls),
    ).not.toContain("442079460958");
  });

  it("stores attributed overview consent facts and retains overview behavior", async () => {
    const response = await POST(
      request(
        { inquiryType: "overview", smsConsent: true },
        "pryzr_referral_code=partnercode",
      ),
    );
    expect(await response.json()).toEqual({ submitted: true });
    expect(mocks.createLead).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: "+442079460958",
        inquiryType: "overview",
        smsConsent: true,
        smsConsentAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
        smsConsentDisclosureVersion,
      }),
    );
  });

  it.each([
    ["missing country code", "2025550123"],
    ["too short", "+123"],
    ["letters", "+1 CALL PRYZR"],
  ])("rejects an invalid phone: %s", async (_label, phone) => {
    const response = await POST(request({ phone }));
    expect(response.status).toBe(400);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("rejects a stale disclosure version", async () => {
    const response = await POST(
      request({ smsConsent: true, smsConsentDisclosureVersion: "old" }),
    );
    expect(response.status).toBe(400);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("returns clear Spanish validation without reflecting the phone number", async () => {
    const response = await POST(request({ locale: "es", phone: "555-1234" }));
    const result = await response.json();
    expect(result.error).toMatch(/número móvil internacional/);
    expect(result.error).not.toContain("555-1234");
  });
});
