import { createHmac, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const sessionDurationSeconds = 60 * 60 * 8;

export const adminSessionCookie = "pryzr_admin_session";

type Session = {
  expiresAt: number;
  username: string;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export async function verifyAdminPassword(password: string) {
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!username || !passwordHash) {
    throw new Error("Admin credentials are not configured.");
  }

  const [salt, expectedHash] = passwordHash.split(":");
  if (!salt || !expectedHash) {
    throw new Error("ADMIN_PASSWORD_HASH has an invalid format.");
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedKey = Buffer.from(expectedHash, "hex");

  return timingSafeEqual(derivedKey, expectedKey) ? username : null;
}

export function createAdminSession(username: string) {
  const session: Session = {
    expiresAt: Math.floor(Date.now() / 1000) + sessionDurationSeconds,
    username,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(value: string | undefined) {
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
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    return session.expiresAt > Math.floor(Date.now() / 1000) ? session : null;
  } catch {
    return null;
  }
}

export const adminSessionMaxAge = sessionDurationSeconds;
