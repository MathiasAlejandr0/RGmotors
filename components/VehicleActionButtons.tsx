"use client";

import { useState } from "react";
import Link from "next/link";
import { Vehicle, formatCLP } from "@/lib/vehicles";
import { whatsappLink } from "@/lib/company";
import TradeInModal from "./TradeInModal";
import VehiclePdfButton from "./VehiclePdfButton";
import FastCreditPreApprovalModal from "./FastCreditPreApprovalModal";
import PriceAlertModal from "./PriceAlertModal";

export default function VehicleActionButtons({ vehicle: v }: { vehicle: Vehicle }) {
  const [isTradeInOpen, setIsTradeInOpen] = useState(false);
  const [isCreditSimulationOpen, setIsCreditSimulationOpen] = useState(false);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);

  return (
    <>
      <div className="space-y-2.5">
        <a
          href={whatsappLink(
            `Hola RG Motors, me interesa el ${v.brand} ${v.model} ${v.year} publicado en ${formatCLP(v.price)}. ¿Me pueden brindar más información y disponibilidad?`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] hover:bg-[#20bd5a] py-3.5 text-center text-xs font-bold text-white transition shadow-sm hover:scale-[1.01] active:scale-95"
        >
          <span>💬</span> Hablar con un asesor por WhatsApp
        </a>

        <button
          onClick={() => setIsCreditSimulationOpen(true)}
          className="apple-btn-primary w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-center text-xs font-bold text-white shadow-glow transition hover:scale-[1.01] active:scale-95"
        >
          <span>⚡</span> Simular crédito para este auto
        </button>

        <button
          onClick={() => setIsTradeInOpen(true)}
          className="apple-btn-secondary flex items-center justify-center gap-2 w-full rounded-full py-2.5 text-center text-xs font-semibold text-white transition hover:border-brand-400/50"
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
            className="apple-btn-secondary flex items-center justify-center gap-1.5 w-full rounded-full py-2.5 text-center text-[11px] font-medium text-amber-300/90 border-amber-400/20 hover:border-amber-400/50 hover:bg-amber-400/5 transition"
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

      <FastCreditPreApprovalModal
        isOpen={isCreditSimulationOpen}
        onClose={() => setIsCreditSimulationOpen(false)}
        targetVehicle={v}
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
