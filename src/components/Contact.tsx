"use client";

import { FormEvent, useState } from "react";
import { hasMarketingConsent } from "@/components/ConsentAndAnalytics";
import type { Locale } from "@/lib/locale";

export function Contact({ locale }: { locale: Locale }) {
  const isSpanish = locale === "es";
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/strategy-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...Object.fromEntries(formData),
        locale,
        eventSourceUrl: window.location.href,
        marketingConsent: hasMarketingConsent(),
      }),
    });
    const result: { calendarUrl?: string; error?: string } =
      await response.json();

    if (!response.ok || !result.calendarUrl) {
      setSubmissionError(
        result.error ?? (isSpanish ? "No pudimos enviar tu solicitud. Inténtalo de nuevo." : "We could not send your request. Please try again."),
      );
      setIsSubmitting(false);
      return;
    }

    window.location.assign(result.calendarUrl);
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-line bg-surface py-24 md:py-32"
    >
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/4 -translate-y-1/4 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {isSpanish ? "Llamada estratégica" : "Strategy call"}
        </p>
        <h2 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {isSpanish ? "¿Listo para crear tu marca de casino social?" : "Ready to build your social casino brand?"}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {isSpanish ? "Cuéntanos en qué etapa estás. Revisaremos la plataforma, el proceso de lanzamiento y lo que necesitas para llevar tu marca al mercado." : "Tell us where you are in the process. We’ll walk through the platform, launch path, and what it takes to bring your brand live."}
        </p>

        <form
          className="mt-12 max-w-xl space-y-5"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="name" className="sr-only">
              {isSpanish ? "Nombre" : "Name"}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder={isSpanish ? "Nombre" : "Name"}
              className="w-full border-b border-line bg-transparent px-0 py-3 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">
              {isSpanish ? "Email de trabajo" : "Work email"}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={isSpanish ? "Email de trabajo" : "Work email"}
              className="w-full border-b border-line bg-transparent px-0 py-3 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="company" className="sr-only">
              {isSpanish ? "Empresa" : "Company"}
            </label>
            <input
              id="company"
              name="company"
              type="text"
              placeholder={isSpanish ? "Empresa" : "Company"}
              className="w-full border-b border-line bg-transparent px-0 py-3 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="budget" className="sr-only">
              {isSpanish ? "Inversión prevista" : "Planned investment"}
            </label>
            <select
              id="budget"
              name="budget"
              defaultValue=""
              required
              className="w-full border-b border-line bg-transparent px-0 py-3 text-foreground outline-none transition-colors focus:border-accent"
            >
              <option value="" disabled className="bg-surface text-muted">
                {isSpanish ? "Inversión prevista" : "Planned investment"}
              </option>
              <option value="Exploring options" className="bg-surface">
                {isSpanish ? "Aún explorando opciones" : "Still exploring"}
              </option>
              <option value="Under $50k" className="bg-surface">
                {isSpanish ? "Menos de $50 mil" : "Under $50k"}
              </option>
              <option value="$50k-$100k" className="bg-surface">
                $50k–$100k
              </option>
              <option value="$100k-$250k" className="bg-surface">
                $100k–$250k
              </option>
              <option value="$250k+" className="bg-surface">
                $250k+
              </option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="sr-only">
              {isSpanish ? "Visión de marca" : "Brand vision"}
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder={isSpanish ? "Cuéntanos sobre la marca que quieres lanzar" : "Tell us about the brand you want to launch"}
              className="w-full resize-y border-b border-line bg-transparent px-0 py-3 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-white"
          >
            {isSubmitting ? (isSpanish ? "Enviando tu solicitud..." : "Sending your request...") : (isSpanish ? "Solicita una llamada estratégica" : "Request a strategy call")}
          </button>
          {submissionError && (
            <p className="text-sm text-rose-300" role="alert">
              {submissionError}
            </p>
          )}
        </form>

        <p className="mt-8 text-sm text-muted">
          {isSpanish ? "O escribe a " : "Or email "}
          <a
            href="mailto:brandon@pryzr.com"
            className="text-foreground underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
          >
            brandon@pryzr.com
          </a>
        </p>
      </div>
    </section>
  );
}
