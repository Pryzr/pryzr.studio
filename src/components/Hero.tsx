"use client";

import { PointerEvent, useState } from "react";
import type { Locale } from "@/lib/locale";

export function Hero({ locale }: { locale: Locale }) {
  const isSpanish = locale === "es";
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function updateTilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((event.clientY - bounds.top) / bounds.height - 0.5) * -10,
      y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 12,
    });
  }

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden site-grain pb-16 pt-28 md:pb-24 md:pt-36"
    >
      <video
        aria-hidden="true"
        autoPlay
        className="hero-background-video"
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/media/pryzr-launchpad-clean.mp4" type="video/mp4" />
      </video>
      <div aria-hidden className="hero-video-overlay" />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -right-24 top-16 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] md:h-[36rem] md:w-[36rem]"
      />
      <div aria-hidden className="aurora-orb aurora-orb-cyan" />
      <div aria-hidden className="aurora-orb aurora-orb-violet" />
      <div aria-hidden className="aurora-orb aurora-orb-pink" />
      <div aria-hidden className="hero-grid" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-14 px-6 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
            Pryzr Studio
          </p>
          <p className="animate-fade-up mt-5 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl md:text-8xl">
            PRYZR
          </p>
          <div className="mt-6 max-w-2xl">
          <h1 className="animate-fade-up-delay-1 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {isSpanish
              ? "Lanza tu marca de casino social. Déjanos la complejidad a nosotros."
              : "Launch your social casino brand. Leave the complexity to us."}
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {isSpanish
              ? "Lanza un casino social bajo tu marca en 4 a 6 semanas con la plataforma, los juegos, la orientación de cumplimiento y el soporte operativo para escalar."
              : "Launch a branded social casino in 4–6 weeks with the platform, games, compliance guidance, and operational support to scale."}
          </p>
          <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="rounded-sm bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-white"
            >
              {isSpanish ? "Agenda una llamada estratégica" : "Book a strategy call"}
            </a>
            <a
              href="#launch-path"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
            >
              {isSpanish ? "Explora el proceso de lanzamiento" : "Explore the launch path"}
            </a>
          </div>
          <div className="mt-12 grid max-w-2xl gap-3 border-t border-line pt-6 sm:grid-cols-3 sm:gap-6">
            <p className="text-sm leading-snug text-muted">
              <span className="block font-[family-name:var(--font-display)] text-base font-semibold text-foreground">
                {isSpanish ? "4–6 semanas" : "4–6 weeks"}
              </span>
              {isSpanish ? "Proceso guiado desde la incorporación hasta el lanzamiento" : "Guided path from onboarding to launch"}
            </p>
            <p className="text-sm leading-snug text-muted">
              <span className="block font-[family-name:var(--font-display)] text-base font-semibold text-foreground">
                {isSpanish ? "Un solo socio" : "One partner"}
              </span>
              {isSpanish ? "Plataforma, pagos y operaciones" : "Platform, payments, and operations"}
            </p>
            <p className="text-sm leading-snug text-muted">
              <span className="block font-[family-name:var(--font-display)] text-base font-semibold text-foreground">
                {isSpanish ? "Creado para crecer" : "Built to grow"}
              </span>
              {isSpanish ? "CRM, VIP, gamificación y geolocalización" : "CRM, VIP, gamification, and geofencing"}
            </p>
          </div>
        </div>
        </div>

        <div
          className="hero-device-stage animate-fade-up-delay-1 relative mx-auto w-full max-w-xl lg:max-w-none"
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          onPointerMove={updateTilt}
        >
          <div aria-hidden className="hero-orbit hero-orbit-one" />
          <div aria-hidden className="hero-orbit hero-orbit-two" />
          <span aria-hidden className="floating-chip floating-chip-one">P</span>
          <span aria-hidden className="floating-chip floating-chip-two">+</span>
          <span aria-hidden className="floating-chip floating-chip-three">★</span>
          <div
            className="hero-device-motion"
            style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          >
            <div className="hero-console relative overflow-hidden rounded-[1.75rem] border border-white/15 p-3 shadow-2xl shadow-black/40">
              <div aria-hidden className="console-scan" />
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Pryzr Launchpad</span>
              </div>
              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-semibold text-accent">Live</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1.35fr_0.65fr]">
              <div className="game-stage rounded-2xl p-5">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  <span>{isSpanish ? "Tu catálogo de juegos" : "Your game catalog"}</span>
                  <span className="text-accent">{isSpanish ? "6.000+ títulos" : "6,000+ titles"}</span>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-2">
                  <div className="game-tile game-tile-violet"><span>NEON<br />REELS</span></div>
                  <div className="game-tile game-tile-gold"><span>GOLDEN<br />TIDE</span></div>
                  <div className="game-tile game-tile-pink"><span>LUCKY<br />NOVA</span></div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/65">{isSpanish ? "Configurado para tu marca" : "Configured for your brand"}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm text-accent">+</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="glass-stat rounded-2xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{isSpanish ? "Preparación" : "Launch readiness"}</p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-foreground">92%</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[92%] rounded-full bg-accent" /></div>
                </div>
                <div className="glass-stat rounded-2xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{isSpanish ? "Herramientas de crecimiento" : "Growth tools"}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="tool-pill">CRM</span>
                    <span className="tool-pill">VIP</span>
                    <span className="tool-pill">Geo</span>
                    <span className="tool-pill">LiveOps</span>
                  </div>
                </div>
              </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="glass-stat rounded-xl px-3 py-3"><span className="block text-[10px] uppercase tracking-[0.14em] text-muted">{isSpanish ? "Marca" : "Brand"}</span><span className="mt-1 block text-xs font-semibold text-foreground">{isSpanish ? "Tuya" : "Yours"}</span></div>
              <div className="glass-stat rounded-xl px-3 py-3"><span className="block text-[10px] uppercase tracking-[0.14em] text-muted">Platform</span><span className="mt-1 block text-xs font-semibold text-foreground">Pryzr</span></div>
              <div className="glass-stat rounded-xl px-3 py-3"><span className="block text-[10px] uppercase tracking-[0.14em] text-muted">{isSpanish ? "Estado" : "Status"}</span><span className="mt-1 block text-xs font-semibold text-accent">{isSpanish ? "Listo para escalar" : "Ready to scale"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
