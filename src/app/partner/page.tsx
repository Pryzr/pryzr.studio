import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CopyReferralUrl } from "@/components/CopyReferralUrl";
import {
  partnerSessionCookie,
  verifyPartnerSession,
} from "@/lib/partner-auth";
import {
  findReferralPartnerById,
  getPartnerReferralLeads,
} from "@/lib/referrals";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Partner portal | Pryzr Studio",
};

function maskLead(value: string) {
  if (value.includes("@")) {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 1)}${"•".repeat(Math.max(local.length - 1, 2))}@${domain}`;
  }
  return `${value.slice(0, 1)}${"•".repeat(Math.max(value.length - 1, 2))}`;
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function PartnerPage() {
  const session = verifyPartnerSession(
    (await cookies()).get(partnerSessionCookie)?.value,
  );
  if (!session) {
    redirect("/partner/login");
  }

  const partner = await findReferralPartnerById(session.partnerId);
  if (!partner) {
    redirect("/partner/login");
  }

  const leads = await getPartnerReferralLeads(partner.id);
  const pending = leads.filter((lead) => lead.status === "pending").length;
  const qualified = leads.filter((lead) => lead.status === "qualified").length;
  const referralUrl = `https://pryzr.studio/r/${partner.referral_code}`;

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.2em] text-accent">
              PRYZR STUDIO
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
              Welcome, {partner.name}
            </h1>
          </div>
          <form action="/api/partner/logout" method="post">
            <button className="border border-line px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent" type="submit">
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-10 border border-line bg-surface p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Your referral link
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Share this link. Referrals are attributed for 90 days after a visit.
          </p>
          <CopyReferralUrl url={referralUrl} />
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Submitted referrals", leads.length],
            ["Pending", pending],
            ["Qualified", qualified],
          ].map(([label, value]) => (
            <article className="border border-line bg-surface p-5" key={label as string}>
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
                {value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Submitted referrals
          </h2>
          {leads.length === 0 ? (
            <p className="mt-4 border border-line bg-surface p-6 text-sm text-muted">
              Referrals submitted through your link will appear here.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto border border-line">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="bg-surface text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Referral</th>
                    <th className="px-4 py-3 font-medium">Launch timing</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr className="border-t border-line" key={lead.id}>
                      <td className="px-4 py-3 text-foreground">{maskLead(lead.name || lead.email)}</td>
                      <td className="px-4 py-3 text-muted">{lead.launch_timing}</td>
                      <td className="px-4 py-3 capitalize text-muted">{lead.inquiry_type}</td>
                      <td className="px-4 py-3 text-muted">{displayDate(lead.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={lead.status === "qualified" ? "text-accent" : "text-muted"}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
