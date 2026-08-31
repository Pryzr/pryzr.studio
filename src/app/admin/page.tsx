import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GoogleAnalyticsReport } from "@/components/GoogleAnalyticsReport";
import { ClarityReport } from "@/components/ClarityReport";
import { VercelAnalyticsReport } from "@/components/VercelAnalyticsReport";
import { adminSessionCookie, verifyAdminSession } from "@/lib/admin-auth";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Analytics admin | Pryzr Studio",
};

const sources = [
  {
    name: "Google Analytics 4",
    description: "Traffic, acquisition, broad geography, devices, engagement, and scroll-depth events.",
    status: "Configured",
  },
  {
    name: "Microsoft Clarity",
    description: "Consent-based session recordings, heatmaps, rage clicks, and page behavior.",
    status: "Configured",
  },
  {
    name: "Reddit Ads",
    description: "Page visits and server-side strategy-call lead conversions.",
    status: "Configured",
  },
];

export default async function AdminPage() {
  const session = verifyAdminSession((await cookies()).get(adminSessionCookie)?.value);
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.2em] text-accent">
              PRYZR STUDIO
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
              Analytics admin
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              className="font-semibold text-accent underline decoration-accent/50 underline-offset-4"
              href="/admin/referrals"
            >
              Referrals
            </a>
            <p className="text-muted">Signed in as {session.username}</p>
          </div>
        </header>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {sources.map((source) => (
            <article className="border border-line bg-surface p-6" key={source.name}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{source.status}</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                {source.name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{source.description}</p>
            </article>
          ))}
        </section>

        <GoogleAnalyticsReport />
        <ClarityReport />
        <VercelAnalyticsReport />

        <section className="mt-10 border border-line bg-surface p-6">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Live reporting setup
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            Connect provider reporting credentials to populate this portal with live metrics. Google Analytics
            requires a Data API service account and property ID; Clarity requires an API token; Reddit requires Ads
            reporting credentials with advertiser access.
          </p>
        </section>

        <form action="/api/admin/logout" className="mt-8" method="post">
          <button
            className="border border-line px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-accent"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
