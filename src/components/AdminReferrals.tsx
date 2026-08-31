"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReferralLead, ReferralStatus } from "@/lib/referrals";

type PartnerWithCounts = {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  created_at: string;
  total_leads: number;
  pending_leads: number;
  qualified_leads: number;
};

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function AdminReferrals({
  partners,
  initialLeads,
}: {
  partners: PartnerWithCounts[];
  initialLeads: ReferralLead[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [leads, setLeads] = useState(initialLeads);
  const [updatingId, setUpdatingId] = useState("");

  async function createPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setTemporaryPassword("");
    setIsCreating(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/referrals/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email: form.get("email") }),
      });
      const result: { error?: string; temporaryPassword?: string } =
        await response.json();
      if (!response.ok || !result.temporaryPassword) {
        setError(result.error ?? "Unable to create the partner.");
        setIsCreating(false);
        return;
      }

      setTemporaryPassword(result.temporaryPassword);
      event.currentTarget.reset();
      router.refresh();
    } catch (requestError) {
      console.error("Partner creation request failed.", requestError);
      setError("Unable to create the partner. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function updateStatus(id: string, status: ReferralStatus) {
    setError("");
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/admin/referrals/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result: { error?: string; lead?: ReferralLead } = await response.json();
      if (!response.ok || !result.lead) {
        setError(result.error ?? "Unable to update the referral.");
        return;
      }

      const updatedLead = result.lead;
      setLeads((current) =>
        current.map((lead) => (lead.id === id ? updatedLead : lead)),
      );
      router.refresh();
    } catch (requestError) {
      console.error("Referral status update failed.", requestError);
      setError("Unable to update the referral. Please try again.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <>
      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="border border-line bg-surface p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Add referral partner
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A one-time temporary password will be displayed after creation.
          </p>
          <form className="mt-6 space-y-4" onSubmit={createPartner}>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="partner-name">
                Name
              </label>
              <input className="mt-2 w-full border border-line bg-background px-3 py-2 text-foreground outline-none focus:border-accent" id="partner-name" name="name" required type="text" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="partner-email">
                Email
              </label>
              <input className="mt-2 w-full border border-line bg-background px-3 py-2 text-foreground outline-none focus:border-accent" id="partner-email" name="email" required type="email" />
            </div>
            <button className="bg-accent px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isCreating} type="submit">
              {isCreating ? "Creating..." : "Create partner"}
            </button>
          </form>
          {temporaryPassword && (
            <div className="mt-6 border border-accent p-4">
              <p className="text-sm font-semibold text-foreground">Temporary password</p>
              <code className="mt-2 block break-all text-sm text-accent">{temporaryPassword}</code>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Copy it now and distribute it securely. It will not be shown again.
              </p>
            </div>
          )}
          {error && <p className="mt-4 text-sm text-rose-300" role="alert">{error}</p>}
        </div>

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Partners
          </h2>
          {partners.length === 0 ? (
            <p className="mt-4 border border-line bg-surface p-6 text-sm text-muted">
              Create a partner to generate their referral link.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {partners.map((partner) => (
                <article className="border border-line bg-surface p-5" key={partner.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{partner.name}</h3>
                      <p className="mt-1 text-sm text-muted">{partner.email}</p>
                    </div>
                    <p className="text-sm text-muted">{displayDate(partner.created_at)}</p>
                  </div>
                  <a className="mt-4 block break-all text-sm text-accent underline decoration-accent/50 underline-offset-4" href={`https://pryzr.studio/r/${partner.referral_code}`} rel="noreferrer" target="_blank">
                    https://pryzr.studio/r/{partner.referral_code}
                  </a>
                  <p className="mt-4 text-sm text-muted">
                    {partner.total_leads} submitted · {partner.pending_leads} pending · {partner.qualified_leads} qualified
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Referrals
        </h2>
        {leads.length === 0 ? (
          <p className="mt-4 border border-line bg-surface p-6 text-sm text-muted">
            Submitted referrals will appear here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-line">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Partner</th>
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Launch timing</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr className="border-t border-line" key={lead.id}>
                    <td className="px-4 py-3 text-foreground">{lead.partner_name}</td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{lead.name}</p>
                      <p className="mt-1 text-xs text-muted">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{lead.launch_timing}</td>
                    <td className="px-4 py-3 capitalize text-muted">{lead.inquiry_type}</td>
                    <td className="px-4 py-3 text-muted">{displayDate(lead.created_at)}</td>
                    <td className="px-4 py-3">
                      <select aria-label={`Status for ${lead.name}`} className="border border-line bg-background px-2 py-1 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60" disabled={updatingId === lead.id} onChange={(event) => updateStatus(lead.id, event.target.value as ReferralStatus)} value={lead.status}>
                        <option value="pending">Pending</option>
                        <option value="qualified">Qualified</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
