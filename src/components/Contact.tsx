"use client";

import { FormEvent, useState } from "react";
import { hasMarketingConsent } from "@/components/ConsentAndAnalytics";
import type { Locale } from "@/lib/locale";
import { smsConsentDisclosureVersion } from "@/lib/lead";

export function Contact({ locale }: { locale: Locale }) {
  const isSpanish = locale === "es";
  const [inquiryType, setInquiryType] = useState<"call" | "overview">("call");
  const [submissionError, setSubmissionError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError("");
    setSubmissionSuccess("");
    setIsSubmitting(true);
    const trackingAllowed = hasMarketingConsent();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/strategy-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        launchTiming: formData.get("launchTiming"),
        smsConsent: formData.get("smsConsent") === "on",
        smsConsentDisclosureVersion,
        inquiryType,
        locale,
        eventSourceUrl: `${window.location.origin}${window.location.pathname}`,
        marketingConsent: trackingAllowed,
      }),
    });
    const result: { calendarUrl?: string; error?: string } =
      await response.json();

    if (!response.ok) {
      setSubmissionError(
        result.error ??
          (isSpanish
            ? "No pudimos enviar tu solicitud. Inténtalo de nuevo."
            : "We could not send your request. Please try again."),
      );
      setIsSubmitting(false);
      return;
    }

    if (inquiryType === "overview") {
      setSubmissionSuccess(
        isSpanish
          ? "Gracias. Nos pondremos en contacto con tu resumen de preparación para el lanzamiento."
          : "Thank you. We will be in touch with your launch-readiness overview.",
      );
      setIsSubmitting(false);
      return;
    }

    if (!result.calendarUrl) {
      setSubmissionError(
        isSpanish
          ? "No pudimos continuar con tu solicitud. Inténtalo de nuevo."
          : "We could not continue your request. Please try again.",
      );
      setIsSubmitting(false);
      return;
    }

    const calendarUrl = result.calendarUrl;

    if (!trackingAllowed) {
      window.location.assign(calendarUrl);
      return;
    }

    window.clarity?.("event", "strategy_call_submitted");
    let redirected = false;
    const redirectToCalendar = () => {
      if (!redirected) {
        redirected = true;
        window.location.assign(calendarUrl);
      }
    };

    window.gtag?.("event", "generate_lead", {
      event_callback: redirectToCalendar,
      event_timeout: 1000,
      form_name: "strategy_call",
    });
    window.setTimeout(redirectToCalendar, 1000);
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
          {inquiryType === "overview"
            ? isSpanish
              ? "Obtén una visión general de preparación para el lanzamiento."
              : "Get a launch-readiness overview."
            : isSpanish
              ? "Descubre si Pryzr es ideal para tu lanzamiento."
              : "See if Pryzr is right for your launch."}
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          {inquiryType === "overview"
            ? isSpanish
              ? "Comparte algunos detalles y te enviaremos una visión general de alto nivel para ayudarte a evaluar los próximos pasos."
              : "Share a few details and we will send a high-level overview to help you evaluate your next steps."
            : isSpanish
              ? "Cuéntanos cuándo quieres lanzar. Revisaremos si Pryzr se ajusta a tu visión, cronograma y necesidades operativas."
              : "Tell us when you want to launch. We will explore whether Pryzr fits your vision, timeline, and operational needs."}
        </p>

        <form
          aria-label={isSpanish ? "Formulario de consulta" : "Inquiry form"}
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
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-foreground"
            >
              {isSpanish ? "Teléfono móvil" : "Mobile phone"}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              aria-describedby="phone-guidance"
              placeholder={isSpanish ? "+34 612 345 678" : "+1 555 123 4567"}
              pattern="[+][0-9 ().-]{7,24}"
              className="w-full border-b border-line bg-transparent px-0 py-3 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <p id="phone-guidance" className="mt-2 text-xs text-muted">
              {isSpanish
                ? "Incluye el código de país, por ejemplo, +34 612 345 678."
                : "Include the country code, for example, +1 555 123 4567."}
            </p>
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
            <label htmlFor="launchTiming" className="sr-only">
              {isSpanish
                ? "¿Cuándo te gustaría lanzar?"
                : "How soon would you like to launch?"}
            </label>
            <select
              id="launchTiming"
              name="launchTiming"
              defaultValue=""
              required
              className="w-full border-b border-line bg-transparent px-0 py-3 text-foreground outline-none transition-colors focus:border-accent"
            >
              <option value="" disabled className="bg-surface text-muted">
                {isSpanish
                  ? "¿Cuándo te gustaría lanzar?"
                  : "How soon would you like to launch?"}
              </option>
              <option value="Exploring" className="bg-surface">
                {isSpanish ? "Aún estoy explorando" : "I am still exploring"}
              </option>
              <option value="Within 30 days" className="bg-surface">
                {isSpanish ? "Dentro de 30 días" : "Within 30 days"}
              </option>
              <option value="1-3 months" className="bg-surface">
                {isSpanish ? "En 1 a 3 meses" : "In 1-3 months"}
              </option>
              <option value="3-6 months" className="bg-surface">
                {isSpanish ? "En 3 a 6 meses" : "In 3-6 months"}
              </option>
              <option value="6+ months" className="bg-surface">
                {isSpanish ? "Más de 6 meses" : "6+ months"}
              </option>
            </select>
          </div>
          <div className="flex items-start gap-3">
            <input
              id="smsConsent"
              name="smsConsent"
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
            />
            <label
              htmlFor="smsConsent"
              className="text-sm leading-relaxed text-muted"
            >
              {isSpanish
                ? "Acepto recibir mensajes de texto de Pryzr sobre mi consulta y los servicios solicitados. Pueden aplicarse tarifas de mensajes y datos. Responde STOP para dejar de recibirlos."
                : "I agree to receive text messages from Pryzr about my inquiry and requested services. Message and data rates may apply. Reply STOP to opt out."}
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-white"
          >
            {isSubmitting
              ? isSpanish
                ? "Enviando tu solicitud..."
                : "Sending your request..."
              : inquiryType === "overview"
                ? isSpanish
                  ? "Solicitar visión general"
                  : "Request the overview"
                : isSpanish
                  ? "Descubre si Pryzr es ideal"
                  : "See if Pryzr is right for your launch"}
          </button>
          {submissionError && (
            <p className="text-sm text-rose-300" role="alert">
              {submissionError}
            </p>
          )}
          {submissionSuccess && (
            <p className="text-sm text-accent" role="status">
              {submissionSuccess}
            </p>
          )}
        </form>

        <button
          type="button"
          className="mt-6 text-sm text-muted underline decoration-accent/50 underline-offset-4 transition-colors hover:text-foreground"
          onClick={() => {
            setInquiryType(inquiryType === "call" ? "overview" : "call");
            setSubmissionError("");
            setSubmissionSuccess("");
          }}
        >
          {inquiryType === "call"
            ? isSpanish
              ? "¿Aún no estás listo para una llamada? Solicita una visión general de preparación."
              : "Not ready for a call? Request a launch-readiness overview."
            : isSpanish
              ? "¿Prefieres hablarlo? Descubre si Pryzr es ideal para tu lanzamiento."
              : "Prefer to talk it through? See if Pryzr is right for your launch."}
        </button>

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
