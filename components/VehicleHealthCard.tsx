"use client";

import { whatsappLink } from "@/lib/company";

interface VehicleHealthCardProps {
  vehicleName: string;
}

export default function VehicleHealthCard({ vehicleName }: VehicleHealthCardProps) {
  const waUrl = whatsappLink(
    `Hola RG Motors, me interesa solicitar el informe de inspección del vehículo ${vehicleName}. ¿Pueden ayudarme?`
  );

  return (
    <div className="apple-glass-card rounded-3xl p-6 space-y-4">
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <h3 className="text-base font-bold text-white tracking-tight">
            Inspección disponible en sucursal
          </h3>
        </div>
        <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
          Revisamos cada vehículo en nuestro showroom de Puerto Montt. El detalle
          del informe técnico se entrega de forma presencial o a solicitud.
        </p>
      </div>

      <p className="text-xs text-white/65 leading-relaxed">
        Si deseas conocer el estado mecánico y documental de{" "}
        <span className="font-semibold text-white">{vehicleName}</span>, escríbenos
        y te orientamos con la información disponible.
      </p>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="apple-btn-secondary flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold text-white shadow-sm transition active:scale-98"
      >
        <span>💬</span> Solicitar informe por WhatsApp
      </a>
    </div>
  );
}
