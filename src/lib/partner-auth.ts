import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const sessionDurationSeconds = 60 * 60 * 8;

export const partnerSessionCookie = "pryzr_partner_session";
export const partnerSessionMaxAge = sessionDurationSeconds;

type PartnerSession = {
  expiresAt: number;
  partnerId: string;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(`partner-session:${value}`)
    .digest("base64url");
}

export async function hashPartnerPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return { salt, hash: hash.toString("hex") };
}

export async function verifyPartnerPassword(
  password: string,
  salt: string,
  expectedHash: string,
) {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedKey = Buffer.from(expectedHash, "hex");
  return (
    expectedKey.length === derivedKey.length &&
    timingSafeEqual(derivedKey, expectedKey)
  );
}

export function createPartnerSession(partnerId: string) {
  const payload = Buffer.from(
    JSON.stringify({
      expiresAt: Math.floor(Date.now() / 1000) + sessionDurationSeconds,
      partnerId,
    } satisfies PartnerSession),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyPartnerSession(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  if (
    signature.length !== expectedSignature.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as PartnerSession;
    return (
      typeof session.partnerId === "string" &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Math.floor(Date.now() / 1000)
    )
      ? session
      : null;
  } catch {
    return null;
  }
}
