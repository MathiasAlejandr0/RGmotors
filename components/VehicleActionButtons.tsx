"use client";

import { useState } from "react";
import Link from "next/link";
import { Vehicle, formatCLP } from "@/lib/vehicles";
import { whatsappLink } from "@/lib/company";
import TradeInModal from "./TradeInModal";
import VehiclePdfButton from "./VehiclePdfButton";
import PriceAlertModal from "./PriceAlertModal";

export default function VehicleActionButtons({ vehicle: v }: { vehicle: Vehicle }) {
  const [isTradeInOpen, setIsTradeInOpen] = useState(false);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);

  return (
    <>
      <div className="space-y-2.5">
        <a
          href={whatsappLink(
            `Hola RG Motors, me interesa el ${v.brand} ${v.model} ${v.year} publicado en ${formatCLP(v.price)}. ¿Me pueden brindar más información y disponibilidad?`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-[#20bd5a] hover:scale-[1.01] active:scale-95"
        >
          <span>💬</span> Hablar con un asesor por WhatsApp
        </a>

        <Link
          href={`/simulador?auto=${encodeURIComponent(v.slug)}`}
          className="apple-btn-primary flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-center text-xs font-bold text-white shadow-glow transition hover:scale-[1.01] active:scale-95"
        >
          <span>⚡</span> Simular crédito (datos RG Motors)
        </Link>

        <button
          onClick={() => setIsTradeInOpen(true)}
          className="apple-btn-secondary flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-center text-xs font-semibold text-white transition hover:border-brand-400/50"
        >
          <span>🔄</span> Dejar mi auto en parte de pago (Tasación)
        </button>

        <Link
          href={`/prueba-manejo/${v.slug}`}
          className="apple-btn-secondary block w-full rounded-full py-2.5 text-center text-xs font-semibold text-white/85"
        >
          🚗 Agendar prueba de manejo
        </Link>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <VehiclePdfButton vehicle={v} className="w-full" />
          <button
            onClick={() => setIsPriceAlertOpen(true)}
            className="apple-btn-secondary flex w-full items-center justify-center gap-1.5 rounded-full border-amber-400/20 py-2.5 text-center text-[11px] font-medium text-amber-300/90 transition hover:border-amber-400/50 hover:bg-amber-400/5"
          >
            <span>🔔</span> Alerta de precio
          </button>
        </div>
      </div>

      <TradeInModal
        isOpen={isTradeInOpen}
        onClose={() => setIsTradeInOpen(false)}
        targetVehicleName={`${v.brand} ${v.model} (${v.year})`}
        targetVehicleSlug={v.slug}
        targetVehiclePrice={v.price}
      />

      <PriceAlertModal
        isOpen={isPriceAlertOpen}
        onClose={() => setIsPriceAlertOpen(false)}
        vehicleSlug={v.slug}
        vehicleName={`${v.brand} ${v.model} ${v.year}`}
        currentPrice={v.price}
      />
    </>
  );
}
