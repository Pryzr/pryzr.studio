import type { Locale } from "@/lib/locale";

const steps = {
  en: [
  {
    title: "Onboard the essentials",
    body: "We guide company, compliance, and payment onboarding, so you have a clear foundation before the build begins.",
  },
  {
    title: "Build your brand",
    body: "Choose your name and domain, then shape the visual identity and player experience around the audience you want to serve.",
  },
  {
    title: "Launch with confidence",
    body: "We configure your games, CRM, VIP, gamification, geofencing, and payment flows together before your go-live.",
  },
  ],
  es: [
    { title: "Incorpora lo esencial", body: "Te guiamos en la incorporación de empresa, cumplimiento y pagos para que tengas una base clara antes de iniciar el desarrollo." },
    { title: "Construye tu marca", body: "Elige tu nombre y dominio, y luego define la identidad visual y la experiencia del jugador para el público al que quieres llegar." },
    { title: "Lanza con confianza", body: "Configuramos juntos tus juegos, CRM, VIP, gamificación, geolocalización y flujos de pago antes de tu lanzamiento." },
  ],
};

export function HowItWorks({ locale }: { locale: Locale }) {
  const isSpanish = locale === "es";
  return (
    <section
      id="launch-path"
      className="relative border-t border-line bg-background py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {isSpanish ? "Tu proceso de lanzamiento" : "Your launch path"}
        </p>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {isSpanish ? "De la idea de marca a un casino social en vivo." : "From brand idea to live social casino."}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {isSpanish ? "Un proceso guiado de 4 a 6 semanas para lanzamientos estándar. Pryzr coordina las partes necesarias para que puedas enfocarte en construir tu marca." : "A guided 4–6 week path for standard launches. Pryzr coordinates the moving parts so you can focus on building the brand."}
        </p>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps[locale].map((step) => (
            <div key={step.title} className="border-t border-line pt-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
