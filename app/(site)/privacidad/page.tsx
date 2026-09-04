import { COMPANY } from "@/lib/company";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | RG Motors",
  description: "Política de privacidad conforme a la Ley N° 19.628 sobre protección de la vida privada.",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 border-b border-white/[0.08] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Política de Privacidad</h1>
        <p className="mt-2 text-sm text-white/50">
          {COMPANY.name} · Ley N° 19.628 sobre Protección de la Vida Privada
        </p>
      </div>

      <article className="apple-glass-card space-y-6 rounded-3xl p-6 text-sm leading-relaxed text-white/70 sm:p-8">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Responsable</h2>
          <p>
            El responsable del tratamiento de los datos personales es{" "}
            <strong className="text-white">{COMPANY.name}</strong>, con domicilio en{" "}
            {COMPANY.address}. Contacto:{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-brand-300 hover:underline">
              {COMPANY.email}
            </a>{" "}
            · {COMPANY.phoneDisplay}.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Datos que recopilamos</h2>
          <p>
            Podemos recopilar nombre, RUT, teléfono, correo electrónico, datos del vehículo de
            interés, información de simulación de crédito (renta declarada, pie, plazo) y
            mensajes que nos envíes por formularios o WhatsApp, cuando tú los entregas
            voluntariamente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Finalidad</h2>
          <p>
            Usamos tus datos para atender consultas, gestionar solicitudes de reserva, tasación
            o crédito, contactarte comercialmente en relación con vehículos de nuestro
            inventario y mejorar la atención. No vendemos bases de datos a terceros ajenos a
            la operación comercial.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Transferencias</h2>
          <p>
            Podemos compartir datos estrictamente necesarios con entidades financieras
            asociadas (por ejemplo Autofin) cuando solicitas una simulación o evaluación de
            crédito, y con proveedores técnicos que alojan o operan el sitio, bajo deber de
            confidencialidad.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Derechos ARCO</h2>
          <p>
            Conforme a la Ley N° 19.628, puedes solicitar acceso, rectificación, cancelación u
            oposición al tratamiento de tus datos escribiendo a{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-brand-300 hover:underline">
              {COMPANY.email}
            </a>
            . Responderemos en plazos razonables.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">6. Conservación y seguridad</h2>
          <p>
            Conservamos la información el tiempo necesario para las finalidades indicadas y
            obligaciones legales. Aplicamos medidas técnicas y organizativas razonables para
            proteger los datos frente a accesos no autorizados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">7. Actualizaciones</h2>
          <p>
            Esta política puede actualizarse. La versión vigente se publica en este sitio.
            Última actualización: septiembre 2026.
          </p>
        </section>
      </article>
    </main>
  );
}
