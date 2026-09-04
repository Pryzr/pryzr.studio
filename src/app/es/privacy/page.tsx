import { SiteFooter } from "@/components/SiteFooter";

export default function SpanishPrivacyPage() {
  return (
    <>
      <main
        className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 text-foreground md:px-8"
        lang="es"
      >
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">
          Aviso de privacidad
        </h1>
        <p className="mt-6 leading-relaxed text-muted">
          Cuando envías una consulta, Pryzr recopila la información de contacto
          y lanzamiento que proporcionas, incluido tu nombre, email de trabajo,
          número de teléfono móvil, plazo de lanzamiento y si diste tu
          consentimiento por separado para recibir mensajes de texto. Usamos
          esta información para responder a tu consulta y proporcionar los
          servicios o la información que solicitaste.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          Si aceptas recibir mensajes, Pryzr puede contactarte por texto sobre
          tu consulta y los servicios solicitados. Pueden aplicarse tarifas de
          mensajes y datos. Responde STOP para dejar de recibirlos. Rechazar el
          consentimiento para SMS no impide enviar el formulario.
        </p>
      </main>
      <SiteFooter locale="es" />
    </>
  );
}
