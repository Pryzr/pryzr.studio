import { neon } from "@neondatabase/serverless";
import { randomBytes, randomUUID } from "crypto";

export const referralAttributionCookie = "pryzr_referral_code";

export type ReferralStatus = "pending" | "qualified";

export type ReferralPartner = {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  created_at: string;
};

export type ReferralLead = {
  id: string;
  partner_id: string;
  partner_name?: string;
  name: string;
  email: string;
  launch_timing: string;
  inquiry_type: "call" | "overview";
  created_at: string;
  status: ReferralStatus;
  qualified_at: string | null;
};

type ReferralPartnerWithPassword = ReferralPartner & {
  password_salt: string;
  password_hash: string;
};

let schemaInitialization: Promise<void> | undefined;

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

function asRows<T>(value: unknown): T[] {
  if (!Array.isArray(value)) {
    throw new Error("Database query returned an unexpected result.");
  }
  return value as T[];
}

export async function ensureReferralSchema() {
  if (!schemaInitialization) {
    const sql = getDatabase();
    schemaInitialization = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS referral_partners (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
          referral_code TEXT NOT NULL UNIQUE,
          password_salt TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS referral_leads (
          id UUID PRIMARY KEY,
          partner_id UUID NOT NULL REFERENCES referral_partners(id) ON DELETE RESTRICT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          launch_timing TEXT NOT NULL,
          inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('call', 'overview')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified')),
          qualified_at TIMESTAMPTZ
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS referral_leads_partner_created_idx ON referral_leads (partner_id, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS referral_leads_status_created_idx ON referral_leads (status, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS referral_partners_created_idx ON referral_partners (created_at DESC)`;
    })();
  }

  try {
    await schemaInitialization;
  } catch (error) {
    schemaInitialization = undefined;
    throw error;
  }
}

function generateReferralCode() {
  return randomBytes(9).toString("base64url").toLowerCase();
}

export async function findReferralPartnerByCode(code: string) {
  await ensureReferralSchema();
  const normalizedCode = code.trim().toLowerCase();
  if (!/^[a-z0-9_-]{8,32}$/.test(normalizedCode)) {
    return null;
  }

  const sql = getDatabase();
  const partners = asRows<ReferralPartner>(await sql`
    SELECT id, name, email, referral_code, created_at
    FROM referral_partners
    WHERE referral_code = ${normalizedCode}
    LIMIT 1
  `);
  return partners[0] ?? null;
}

export async function findReferralPartnerById(id: string) {
  await ensureReferralSchema();
  const sql = getDatabase();
  const partners = asRows<ReferralPartner>(await sql`
    SELECT id, name, email, referral_code, created_at
    FROM referral_partners
    WHERE id = ${id}
    LIMIT 1
  `);
  return partners[0] ?? null;
}

export async function findReferralPartnerForAuthentication(email: string) {
  await ensureReferralSchema();
  const sql = getDatabase();
  const partners = asRows<ReferralPartnerWithPassword>(await sql`
    SELECT id, name, email, referral_code, password_salt, password_hash, created_at
    FROM referral_partners
    WHERE email = ${email.trim().toLowerCase()}
    LIMIT 1
  `);
  return partners[0] ?? null;
}

export async function createReferralPartner({
  name,
  email,
  passwordSalt,
  passwordHash,
}: {
  name: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
}) {
  await ensureReferralSchema();
  const sql = getDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const partners = asRows<ReferralPartner>(await sql`
      INSERT INTO referral_partners (
        id, name, email, referral_code, password_salt, password_hash
      ) VALUES (
        ${randomUUID()}, ${name.trim()}, ${normalizedEmail}, ${generateReferralCode()},
        ${passwordSalt}, ${passwordHash}
      )
      RETURNING id, name, email, referral_code, created_at
    `.catch((error: unknown) => {
      if (isUniqueViolation(error) && attempt < 2) {
        return [];
      }
      throw error;
    }));

    if (partners[0]) {
      return partners[0];
    }
  }

  throw new Error("Could not create a unique referral partner.");
}

export async function createReferralLead({
  partnerId,
  name,
  email,
  launchTiming,
  inquiryType,
}: {
  partnerId: string;
  name: string;
  email: string;
  launchTiming: string;
  inquiryType: "call" | "overview";
}) {
  await ensureReferralSchema();
  const sql = getDatabase();
  const leads = asRows<ReferralLead>(await sql`
    INSERT INTO referral_leads (id, partner_id, name, email, launch_timing, inquiry_type)
    VALUES (
      ${randomUUID()}, ${partnerId}, ${name.trim()}, ${email.trim().toLowerCase()},
      ${launchTiming.trim()}, ${inquiryType}
    )
    RETURNING id, partner_id, name, email, launch_timing, inquiry_type, created_at, status, qualified_at
  `);
  return leads[0];
}

export async function getPartnerReferralLeads(partnerId: string) {
  await ensureReferralSchema();
  const sql = getDatabase();
  return asRows<ReferralLead>(await sql`
    SELECT id, partner_id, name, email, launch_timing, inquiry_type, created_at, status, qualified_at
    FROM referral_leads
    WHERE partner_id = ${partnerId}
    ORDER BY created_at DESC
  `);
}

export async function getReferralPartnersWithCounts() {
  await ensureReferralSchema();
  const sql = getDatabase();
  return asRows<
    ReferralPartner & {
      total_leads: number;
      pending_leads: number;
      qualified_leads: number;
    }
  >(await sql`
    SELECT
      p.id, p.name, p.email, p.referral_code, p.created_at,
      COUNT(l.id)::int AS total_leads,
      COUNT(l.id) FILTER (WHERE l.status = 'pending')::int AS pending_leads,
      COUNT(l.id) FILTER (WHERE l.status = 'qualified')::int AS qualified_leads
    FROM referral_partners p
    LEFT JOIN referral_leads l ON l.partner_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
}

export async function getAllReferralLeads() {
  await ensureReferralSchema();
  const sql = getDatabase();
  return asRows<ReferralLead>(await sql`
    SELECT
      l.id, l.partner_id, p.name AS partner_name, l.name, l.email, l.launch_timing,
      l.inquiry_type, l.created_at, l.status, l.qualified_at
    FROM referral_leads l
    INNER JOIN referral_partners p ON p.id = l.partner_id
    ORDER BY l.created_at DESC
  `);
}

export async function updateReferralLeadStatus(id: string, status: ReferralStatus) {
  await ensureReferralSchema();
  const sql = getDatabase();
  const leads = asRows<ReferralLead>(await sql`
    UPDATE referral_leads
    SET
      status = ${status},
      qualified_at = CASE WHEN ${status} = 'qualified' THEN NOW() ELSE NULL END
    WHERE id = ${id}
    RETURNING id, partner_id, name, email, launch_timing, inquiry_type, created_at, status, qualified_at
  `);
  return leads[0] ?? null;
}

export function isValidReferralStatus(value: unknown): value is ReferralStatus {
  return value === "pending" || value === "qualified";
}

export function generateTemporaryPassword() {
  return randomBytes(18).toString("base64url");
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}
