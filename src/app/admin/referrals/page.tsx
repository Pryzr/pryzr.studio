import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminReferrals } from "@/components/AdminReferrals";
import { adminSessionCookie, verifyAdminSession } from "@/lib/admin-auth";
import {
  getAllReferralLeads,
  getReferralPartnersWithCounts,
} from "@/lib/referrals";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Referral management | Pryzr Studio",
};

export default async function AdminReferralsPage() {
  const session = verifyAdminSession(
    (await cookies()).get(adminSessionCookie)?.value,
  );
  if (!session) {
    redirect("/admin/login");
  }

  const [partners, leads] = await Promise.all([
    getReferralPartnersWithCounts(),
    getAllReferralLeads(),
  ]);

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.2em] text-accent">
              PRYZR STUDIO
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
              Referral management
            </h1>
          </div>
          <a className="text-sm font-semibold text-accent underline decoration-accent/50 underline-offset-4" href="/admin">
            Back to analytics
          </a>
        </header>
        <AdminReferrals initialLeads={leads} partners={partners} />
      </div>
    </main>
  );
}
