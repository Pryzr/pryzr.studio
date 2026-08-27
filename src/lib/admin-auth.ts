import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const sessionDurationSeconds = 60 * 60 * 8;

export const adminSessionCookie = "pryzr_admin_session";
export const googleOAuthStateCookie = "pryzr_google_oauth_state";
export const googleRefreshTokenCookie = "pryzr_google_refresh_token";

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

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    createHash("sha256").update(getSessionSecret()).digest(),
    iv,
  );
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [iv, authTag, encrypted] = value.split(".");
  if (!iv || !authTag || !encrypted) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      createHash("sha256").update(getSessionSecret()).digest(),
      Buffer.from(iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
