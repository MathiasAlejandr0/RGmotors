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
  const [isPreApprovalOpen, setIsPreApprovalOpen] = useState(false);
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);

  return (
    <>
      <div className="space-y-3">
        <Link
          href={`/reserva/${v.slug}`}
          className="apple-btn-primary block w-full rounded-full py-3.5 text-center text-xs font-bold text-white shadow-glow"
        >
          Reservar online ($200.000 abono)
        </Link>

        <button
          onClick={() => setIsPreApprovalOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 py-3 text-center text-xs font-bold text-emerald-300 hover:bg-emerald-500/25 transition shadow-glow"
        >
          <span>⚡</span> Pre-aprobar crédito en 60s con RUT
        </button>

        <button
          onClick={() => setIsTradeInOpen(true)}
          className="apple-btn-secondary flex items-center justify-center gap-2 w-full rounded-full py-2.5 text-center text-xs font-semibold text-white transition hover:border-brand-500/50"
        >
          <span>🔄</span> Dejar mi auto en parte de pago
        </button>

        <button
          onClick={() => setIsPriceAlertOpen(true)}
          className="apple-btn-secondary flex items-center justify-center gap-2 w-full rounded-full py-2.5 text-center text-xs font-semibold text-amber-300/90 border-amber-400/20 hover:border-amber-400/50 hover:bg-amber-400/5 transition"
        >
          <span>🔔</span> Avísame si baja de precio
        </button>

        <Link
          href={`/prueba-manejo/${v.slug}`}
          className="apple-btn-secondary block w-full rounded-full py-2.5 text-center text-xs font-semibold text-white/80"
        >
          Agendar prueba de manejo sin costo
        </Link>

        <a
          href={whatsappLink(
            `Hola RG Motors, me interesa el ${v.brand} ${v.model} ${v.year} a ${formatCLP(v.price)}. ¿Me pueden contactar?`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366]/90 hover:bg-[#25D366] py-3 text-center text-xs font-semibold text-white transition shadow-sm"
        >
          <span>💬</span> Contactar por WhatsApp
        </a>

        <VehiclePdfButton vehicle={v} className="w-full" />
      </div>

      <TradeInModal
        isOpen={isTradeInOpen}
        onClose={() => setIsTradeInOpen(false)}
        targetVehicleName={`${v.brand} ${v.model} (${v.year})`}
        targetVehicleSlug={v.slug}
        targetVehiclePrice={v.price}
      />

      <FastCreditPreApprovalModal
        isOpen={isPreApprovalOpen}
        onClose={() => setIsPreApprovalOpen(false)}
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
