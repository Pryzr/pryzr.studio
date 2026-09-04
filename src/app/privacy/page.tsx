import { SiteFooter } from "@/components/SiteFooter";

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 text-foreground md:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">
          Privacy notice
        </h1>
        <p className="mt-6 leading-relaxed text-muted">
          When you submit an inquiry, Pryzr collects the contact and launch
          information you provide, including your name, work email, mobile phone
          number, launch timing, and whether you separately consented to text
          messages. We use this information to respond to your inquiry and
          provide the services or information you requested.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          If you opt in to texts, Pryzr may contact you by text about your
          inquiry and requested services. Message and data rates may apply.
          Reply STOP to opt out. Declining SMS consent does not prevent you from
          submitting the form.
        </p>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
