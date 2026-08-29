import type { Locale } from "@/lib/locale";
import { LanguageToggle } from "@/components/LanguageToggle";

export function SiteHeader({ locale }: { locale: Locale }) {
  const isSpanish = locale === "es";
  const prefix = isSpanish ? "/es" : "";

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-8">
        <a
          href={`${prefix}#top`}
          className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.22em] text-foreground"
        >
          PRYZR
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href={`${prefix}#launch-path`} className="transition-colors hover:text-foreground">
            {isSpanish ? "Lanzamiento" : "Launch path"}
          </a>
          <a href={`${prefix}#games`} className="transition-colors hover:text-foreground">
            {isSpanish ? "Juegos" : "Games"}
          </a>
          <a href={`${prefix}#platform`} className="transition-colors hover:text-foreground">
            {isSpanish ? "Plataforma" : "Platform"}
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageToggle locale={locale} />
          <a
            href={`${prefix}#contact`}
            className="rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-white"
          >
            {isSpanish ? "Ver si Pryzr es ideal" : "See if Pryzr fits"}
          </a>
        </div>
      </div>
      <a
        href={`${prefix}#contact`}
        className="fixed inset-x-4 bottom-4 z-40 rounded-sm bg-accent px-4 py-3 text-center text-sm font-semibold text-background shadow-xl transition-colors hover:bg-white md:hidden"
      >
        {isSpanish ? "Descubre si Pryzr es ideal para tu lanzamiento" : "See if Pryzr is right for your launch"}
      </a>
    </header>
  );
}
