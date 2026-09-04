export const smsConsentDisclosureVersion = "2026-09-04-v1";

export function normalizeInternationalPhone(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!/^\+[\d\s().-]+$/.test(trimmed)) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15 || digits.startsWith("0")) {
    return null;
  }

  return `+${digits}`;
}

export function parseSmsConsent(value: unknown) {
  return value === true || value === "true" || value === "on";
}
