import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Platform } from "@/components/Platform";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Solutions } from "@/components/Solutions";

export default function Home() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex-1" lang="en">
        <Hero locale="en" />
        <Platform locale="en" />
        <Solutions locale="en" />
        <HowItWorks locale="en" />
        <Contact locale="en" />
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
