import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Admin sign in | Pryzr Studio",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-md border border-line bg-surface p-8 shadow-2xl">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.2em] text-accent">
          PRYZR STUDIO
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
          Analytics admin
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Sign in to view your connected marketing and analytics sources.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
