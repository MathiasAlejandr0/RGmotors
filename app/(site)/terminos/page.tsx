import { COMPANY } from "@/lib/company";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Uso | RG Motors",
  description: "Términos y condiciones de uso del sitio web y catálogo de RG Motors.",
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 border-b border-white/[0.08] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Términos de Uso</h1>
        <p className="mt-2 text-sm text-white/50">
          Sitio web y catálogo de {COMPANY.name}
        </p>
      </div>

      <article className="apple-glass-card space-y-6 rounded-3xl p-6 text-sm leading-relaxed text-white/70 sm:p-8">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Aceptación</h2>
          <p>
            Al navegar o usar este sitio aceptas estos términos. Si no estás de acuerdo,
            te pedimos no utilizar los formularios ni servicios online.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Información del catálogo</h2>
          <p>
            Las fichas de vehículos (precios, kilometraje, equipamiento, disponibilidad y
            fotografías) son referenciales y pueden cambiar sin previo aviso. La
            disponibilidad se confirma únicamente con el equipo comercial de {COMPANY.name}.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Solicitudes online</h2>
          <p>
            Los formularios de reserva, crédito, tasación o contacto constituyen una
            solicitud de atención, no un contrato de compraventa ni una reserva pagada,
            salvo que se confirme expresamente por escrito o en sucursal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Uso correcto</h2>
          <p>
            Te comprometes a entregar datos veraces y a no usar el sitio para spam, fraude
            o actividades ilícitas. Nos reservamos el derecho de rechazar solicitudes
            abusivas o incompletas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Propiedad intelectual</h2>
          <p>
            Marcas, textos, diseño y fotografías del sitio pertenecen a {COMPANY.name} o a
            sus licenciantes. Queda prohibida su reproducción no autorizada con fines
            comerciales.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">6. Limitación</h2>
          <p>
            En la medida permitida por la ley, {COMPANY.name} no responde por
            interrupciones del servicio web, errores tipográficos o decisiones de compra
            basadas únicamente en información publicada online.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">7. Contacto</h2>
          <p>
            Consultas:{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-brand-300 hover:underline">
              {COMPANY.email}
            </a>{" "}
            ·{" "}
            <Link href="/contacto" className="text-brand-300 hover:underline">
              Página de contacto
            </Link>
            . Última actualización: septiembre 2026.
          </p>
        </section>
      </article>
    </main>
  );
}
