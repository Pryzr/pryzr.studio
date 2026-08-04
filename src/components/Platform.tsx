import type { Locale } from "@/lib/locale";

const capabilities = {
  en: [
  {
    title: "Operator command center",
    body: "Run player operations, promotions, reporting, and configuration from a control plane built for white-label teams.",
  },
  {
    title: "CRM, VIP, and gamification",
    body: "Give your team the tools to recognize loyal players, create engagement loops, and build lasting player relationships.",
  },
  {
    title: "Geofencing and controls",
    body: "Operate with location-aware access controls and the practical infrastructure required to manage a growing brand.",
  },
  {
    title: "Payments and operations",
    body: "Connect with trusted banking and processing partners while Pryzr helps simplify the operational work behind launch.",
  },
  ],
  es: [
    { title: "Centro de control del operador", body: "Gestiona operaciones de jugadores, promociones, informes y configuración desde un centro de control creado para equipos de marca blanca." },
    { title: "CRM, VIP y gamificación", body: "Dale a tu equipo herramientas para reconocer jugadores leales, crear ciclos de interacción y construir relaciones duraderas." },
    { title: "Geolocalización y controles", body: "Opera con controles de acceso según la ubicación y la infraestructura práctica necesaria para gestionar una marca en crecimiento." },
    { title: "Pagos y operaciones", body: "Conéctate con socios bancarios y de procesamiento confiables mientras Pryzr ayuda a simplificar el trabajo operativo detrás del lanzamiento." },
  ],
};

export function Platform({ locale }: { locale: Locale }) {
  const isSpanish = locale === "es";
  return (
    <section id="platform" className="relative border-t border-line bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Platform
        </p>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {isSpanish ? "La base operativa detrás de tu marca." : "The operating foundation behind your brand."}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {isSpanish ? "Pryzr es más que una plataforma. Es la tecnología, el soporte operativo y la orientación práctica que hacen que un lanzamiento sea manejable." : "Pryzr is more than a platform. It is the technology, operational support, and practical guidance that help make a launch manageable."}
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="platform-map rounded-3xl border border-white/10 p-6 md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">{isSpanish ? "El ecosistema Pryzr" : "The Pryzr ecosystem"}</p>
            <div className="relative mt-8 grid gap-3">
              <div className="platform-node platform-node-primary"><span>{isSpanish ? "Experiencia de marca" : "Brand experience"}</span><small>{isSpanish ? "Diseño, dominio, catálogo" : "Design, domain, catalog"}</small></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="platform-node"><span>{isSpanish ? "Interacción" : "Engagement"}</span><small>CRM, VIP, {isSpanish ? "promociones" : "promos"}</small></div>
                <div className="platform-node"><span>{isSpanish ? "Operaciones" : "Operations"}</span><small>{isSpanish ? "Pagos, soporte" : "Payments, support"}</small></div>
              </div>
              <div className="platform-node"><span>{isSpanish ? "Crecimiento controlado" : "Controlled growth"}</span><small>{isSpanish ? "Geolocalización, informes, orientación de cumplimiento" : "Geofencing, reporting, compliance guidance"}</small></div>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
          {capabilities[locale].map((item) => (
            <li key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  );
}
