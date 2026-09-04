import type { Locale } from "@/lib/locale";
import { CookiePreferencesButton } from "@/components/ConsentAndAnalytics";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-line bg-background py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-muted md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-[family-name:var(--font-display)] font-semibold tracking-[0.18em] text-foreground">
          PRYZR
        </p>
        <p>
          {locale === "es"
            ? "La base operativa para marcas independientes de casino social."
            : "The operating foundation for independent social casino brands."}
        </p>
        <CookiePreferencesButton locale={locale} />
        <a
          className="transition-colors hover:text-foreground"
          href={locale === "es" ? "/es/privacy" : "/privacy"}
        >
          {locale === "es" ? "Privacidad" : "Privacy"}
        </a>
        <a
          className="transition-colors hover:text-foreground"
          href="/partner/login"
        >
          {locale === "es" ? "Socios" : "Partners"}
        </a>
        <p>&copy; {new Date().getFullYear()} PRYZR.studio</p>
      </div>
    </footer>
  );
}
