import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Platform } from "@/components/Platform";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Solutions } from "@/components/Solutions";

export const metadata: Metadata = {
  title: "Pryzr Studio — Lanza tu marca de casino social",
  description:
    "Lanza un casino social bajo tu marca en 4 a 6 semanas con Pryzr Studio: tecnología, juegos, orientación de cumplimiento, pagos y soporte operativo.",
  alternates: {
    canonical: "/es",
    languages: {
      en: "/",
      es: "/es",
    },
  },
};

export default function SpanishHome() {
  return (
    <>
      <SiteHeader locale="es" />
      <main className="flex-1" lang="es">
        <Hero locale="es" />
        <Platform locale="es" />
        <Solutions locale="es" />
        <HowItWorks locale="es" />
        <Contact locale="es" />
      </main>
      <SiteFooter locale="es" />
    </>
  );
}
