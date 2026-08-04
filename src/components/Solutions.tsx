import type { Locale } from "@/lib/locale";

const pillars = {
  en: [
  {
    title: "6,000+ games, selected for your brand",
    body: "Build a catalog around your audience with a broad library of slots, fish shooters, and casino experiences. Choose the categories and games that make your site feel unmistakably yours.",
  },
  {
    title: "A catalog that keeps evolving",
    body: "Refresh your mix as player preferences and brand strategy change. Every partner receives regular releases and seasonal content after launch.",
  },
  {
    title: "Exclusive content as you scale",
    body: "Reach agreed growth milestones and unlock a custom, fully brand-themed game built exclusively for your audience.",
  },
  ],
  es: [
    { title: "6.000+ juegos seleccionados para tu marca", body: "Crea un catálogo para tu público con una amplia biblioteca de tragamonedas, juegos de pesca y experiencias de casino. Elige las categorías y juegos que hacen que tu sitio sea inconfundiblemente tuyo." },
    { title: "Un catálogo que sigue evolucionando", body: "Actualiza tu selección según cambien las preferencias de los jugadores y la estrategia de marca. Cada socio recibe lanzamientos regulares y contenido de temporada después del lanzamiento." },
    { title: "Contenido exclusivo a medida que creces", body: "Alcanza los objetivos de crecimiento acordados y desbloquea un juego personalizado, totalmente temático para tu marca y exclusivo para tu público." },
  ],
};

export function Solutions({ locale }: { locale: Locale }) {
  const isSpanish = locale === "es";
  const marqueeItems = isSpanish ? ["TRAGAMONEDAS", "JUEGOS DE PESCA", "JACKPOTS", "JUEGOS DE MESA", "ORIGINALES PRYZR", "LANZAMIENTOS DE TEMPORADA"] : ["SLOTS", "FISH SHOOTERS", "JACKPOTS", "TABLE GAMES", "PRYZR ORIGINALS", "SEASONAL DROPS"];
  return (
    <section
      id="games"
      className="relative overflow-hidden border-t border-line bg-surface py-24 md:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {isSpanish ? "Oferta de juegos" : "Game offering"}
        </p>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {isSpanish ? "Una biblioteca de juegos tan única como tu marca." : "A game library as unique as your brand."}
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {isSpanish ? "Comienza con una selección inigualable y sigue evolucionando con contenido original y juegos exclusivos diseñados para las marcas que crecen con Pryzr." : "Start with unmatched choice, then keep evolving with original content and exclusive games designed for the brands that grow with Pryzr."}
        </p>

        <div className="game-marquee mt-12 overflow-hidden border-y border-white/10 py-3">
          <div className="game-marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-5 px-5 text-[11px] font-bold tracking-[0.18em] text-foreground/70">
                {item}<i className="h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          <div className="game-card game-card-aurora min-h-56 rounded-2xl p-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{isSpanish ? "Mundos de tragamonedas" : "Slot worlds"}</span>
            <strong className="mt-auto block font-[family-name:var(--font-display)] text-2xl leading-none text-white">{isSpanish ? <>Interacción<br />por diseño.</> : <>Engaging<br />by design.</>}</strong>
          </div>
          <div className="game-card game-card-ocean min-h-56 rounded-2xl p-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{isSpanish ? "Juegos de pesca" : "Fish shooters"}</span>
            <strong className="mt-auto block font-[family-name:var(--font-display)] text-2xl leading-none text-white">{isSpanish ? <>Juego que<br />atrae jugadores.</> : <>Play that<br />pulls players in.</>}</strong>
          </div>
          <div className="game-card game-card-flare min-h-56 rounded-2xl p-5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{isSpanish ? "Originales Pryzr" : "Pryzr originals"}</span>
            <strong className="mt-auto block font-[family-name:var(--font-display)] text-2xl leading-none text-white">{isSpanish ? <>Creado para<br />tu próximo nivel.</> : <>Built for<br />your next level.</>}</strong>
          </div>
        </div>

        <ol className="mt-12 grid gap-3 md:grid-cols-3">
          {pillars[locale].map((item, index) => (
            <li
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-accent/35"
            >
              <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
