import type { Locale } from "@/lib/locale";

const capabilities = {
  en: [
  {
    title: "Operate from one place",
    body: "Coordinate player operations, promotions, reporting, and configuration without stitching together disconnected tools.",
  },
  {
    title: "Build player value",
    body: "Use CRM, VIP, and gamification tools to recognize loyal players and create stronger engagement loops.",
  },
  {
    title: "Grow with control",
    body: "Use location-aware access controls, reporting, and practical compliance guidance as your brand develops.",
  },
  {
    title: "Launch with coordinated operations",
    body: "Bring together payments, support, and operational workflows with a team that helps manage the moving parts.",
  },
  ],
  es: [
    { title: "Opera desde un solo lugar", body: "Coordina operaciones de jugadores, promociones, informes y configuración sin unir herramientas desconectadas." },
    { title: "Crea valor para el jugador", body: "Usa CRM, VIP y gamificación para reconocer jugadores leales y crear ciclos de interacción más sólidos." },
    { title: "Crece con control", body: "Usa controles de acceso según la ubicación, informes y orientación práctica de cumplimiento mientras tu marca evoluciona." },
    { title: "Lanza con operaciones coordinadas", body: "Integra pagos, soporte y flujos operativos con un equipo que ayuda a gestionar las partes necesarias." },
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
          {isSpanish ? "Todo lo necesario para lanzar y operar con confianza." : "Everything needed to launch and operate with confidence."}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {isSpanish ? "Pryzr reúne la tecnología, el soporte operativo y la orientación práctica que necesitas para convertir una idea de marca en una operación gestionable." : "Pryzr brings together the technology, operational support, and practical guidance needed to turn a brand idea into a manageable operation."}
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
