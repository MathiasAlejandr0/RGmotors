import Link from "next/link";
import { Vehicle, formatCLP, estimateMonthly } from "@/lib/vehicles";

export default function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  return (
    <Link
      href={`/vehiculo/${v.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800/60 transition hover:border-brand-500/50 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-ink-700 to-ink-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.image}
          alt={`${v.brand} ${v.model}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs backdrop-blur">
          360° disponible
        </span>
        {v.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-500 px-2.5 py-1 text-xs font-medium">
            Destacado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {v.brand} {v.model}
          </h3>
          <span className="text-xs text-white/40">{v.year}</span>
        </div>
        <p className="text-sm text-white/50">{v.version}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-white/50">
          <span className="rounded-md bg-white/5 px-2 py-0.5">
            {v.km.toLocaleString("es-CL")} km
          </span>
          <span className="rounded-md bg-white/5 px-2 py-0.5">{v.fuel}</span>
          <span className="rounded-md bg-white/5 px-2 py-0.5">{v.transmission}</span>
        </div>
        <div className="mt-auto pt-4">
          <p className="text-xl font-bold text-brand-300">{formatCLP(v.price)}</p>
          <p className="text-xs text-white/40">
            o {formatCLP(estimateMonthly(v.price))}/mes
          </p>
          <span className="mt-3 block rounded-lg border border-white/10 py-2 text-center text-sm font-medium text-white/80 transition group-hover:bg-brand-500 group-hover:text-white">
            Ver detalle
          </span>
        </div>
      </div>
    </Link>
  );
}
