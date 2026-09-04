import { describe, expect, it } from "vitest";
import { normalizeInternationalPhone, parseSmsConsent } from "@/lib/lead";

describe("lead phone and consent parsing", () => {
  it.each([
    ["+1 (555) 123-4567", "+15551234567"],
    ["+34 612 345 678", "+34612345678"],
    ["+44.20.7946.0958", "+442079460958"],
  ])("normalizes %s without losing the country code", (input, expected) => {
    expect(normalizeInternationalPhone(input)).toBe(expected);
  });

  it.each([
    "5551234567",
    "+123",
    "+0123456789",
    "+1234567890123456",
    "+1 call me",
  ])("rejects invalid international number %s", (input) =>
    expect(normalizeInternationalPhone(input)).toBeNull(),
  );

  it("only treats explicit true values as SMS consent", () => {
    expect(parseSmsConsent(true)).toBe(true);
    expect(parseSmsConsent("on")).toBe(true);
    expect(parseSmsConsent(false)).toBe(false);
    expect(parseSmsConsent(undefined)).toBe(false);
  });
});
