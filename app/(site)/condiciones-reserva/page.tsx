import { COMPANY } from "@/lib/company";
import { formatCLP } from "@/lib/vehicles";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Condiciones de solicitud de prioridad | RG Motors",
  description:
    "Condiciones de la solicitud de prioridad / abono referencial sobre vehículos del catálogo RG Motors.",
};

const RESERVE_AMOUNT = 200_000;

export default function CondicionesReservaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 border-b border-white/[0.08] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Condiciones de solicitud de prioridad
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Separación de unidad · Sin pago online
        </p>
      </div>

      <article className="apple-glass-card space-y-6 rounded-3xl p-6 text-sm leading-relaxed text-white/70 sm:p-8">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Qué es esta solicitud</h2>
          <p>
            Al enviar el formulario de prioridad sobre un vehículo, solicitas que el equipo de{" "}
            {COMPANY.name} te contacte para confirmar disponibilidad y coordinar un abono
            referencial en tienda o por WhatsApp.{" "}
            <strong className="text-white">No es un contrato de compraventa</strong> ni una
            reserva pagada online.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Abono referencial</h2>
          <p>
            El monto referencial publicado es de{" "}
            <strong className="text-white">{formatCLP(RESERVE_AMOUNT)}</strong>. Se coordina
            únicamente si hay disponibilidad y se confirma con un asesor. Este sitio{" "}
            <strong className="text-white">no cobra ni procesa pagos</strong> (no hay WebPay ni
            cargo automático).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Disponibilidad</h2>
          <p>
            El stock puede cambiar sin previo aviso. La prioridad se confirma solo cuando un
            asesor valida que la unidad sigue disponible.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Vigencia y devoluciones</h2>
          <p>
            Las condiciones del abono (plazo de vigencia, destinos del monto y eventual
            devolución) se informan al coordinar en sucursal o WhatsApp, antes de que realices
            cualquier pago. Mientras no haya abono confirmado, puedes desistir de la solicitud
            sin costo.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Contacto</h2>
          <p>
            Consultas:{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-brand-300 hover:underline">
              {COMPANY.email}
            </a>{" "}
            ·{" "}
            <Link href="/contacto" className="text-brand-300 hover:underline">
              Contacto
            </Link>
            . Última actualización: septiembre 2026.
          </p>
        </section>
      </article>
    </main>
  );
}
