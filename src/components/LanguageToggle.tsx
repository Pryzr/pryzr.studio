"use client";

import Link from "next/link";
import type { Locale } from "@/lib/locale";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const targetLocale: Locale = locale === "en" ? "es" : "en";
  const href = targetLocale === "es" ? "/es" : "/";

  function rememberLanguage() {
    document.cookie = `pryzr_locale=${targetLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <Link
      href={href}
      lang={targetLocale}
      onClick={rememberLanguage}
      className="text-xs font-semibold tracking-[0.12em] text-muted transition-colors hover:text-accent"
    >
      {targetLocale === "es" ? "ES" : "EN"}
    </Link>
  );
}
