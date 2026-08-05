"use client";

import { useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { vehicles, Vehicle, formatCLP } from "@/lib/vehicles";

const ROWS: { label: string; get: (v: Vehicle) => string }[] = [
  { label: "Precio", get: (v) => formatCLP(v.price) },
  { label: "Año", get: (v) => String(v.year) },
  { label: "Kilometraje", get: (v) => `${v.km.toLocaleString("es-CL")} km` },
  { label: "Motor", get: (v) => v.engine },
  { label: "Potencia", get: (v) => v.power },
  { label: "Transmisión", get: (v) => v.transmission },
  { label: "Tracción", get: (v) => v.traction },
  { label: "Combustible", get: (v) => v.fuel },
  { label: "Puertas", get: (v) => String(v.doors) },
  { label: "Carrocería", get: (v) => v.bodyType },
];

export default function ComparadorPage() {
  const [selected, setSelected] = useState<string[]>([
    "toyota-rav4-2022",
    "mazda-cx5-2021",
  ]);

  const cars = selected
    .map((s) => vehicles.find((v) => v.slug === s))
    .filter(Boolean) as Vehicle[];
  const available = vehicles.filter((v) => !selected.includes(v.slug));

  const addCar = (slug: string) => {
    if (selected.length < 3 && slug) setSelected([...selected, slug]);
  };
  const removeCar = (slug: string) => setSelected(selected.filter((s) => s !== slug));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Comparador de vehículos</h1>
      <p className="mt-1 text-white/50">Compara hasta 3 autos lado a lado.</p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-40 p-3 text-left align-bottom text-sm text-white/40">
                Vehículos seleccionados
              </th>
              {cars.map((v) => (
                <th key={v.slug} className="p-3 align-top">
                  <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset(v.image)} alt={v.model} className="h-24 w-full rounded-lg object-cover" />
                    <p className="mt-2 text-sm font-semibold">{v.brand} {v.model}</p>
                    <p className="text-xs text-white/50">{v.version}</p>
                    <button
                      onClick={() => removeCar(v.slug)}
                      className="mt-2 text-xs text-red-400 hover:text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                </th>
              ))}
              {selected.length < 3 && (
                <th className="p-3 align-top">
                  <div className="grid h-full min-h-[160px] place-items-center rounded-2xl border border-dashed border-white/15 bg-ink-800/30 p-3">
                    <div className="text-center">
                      <p className="mb-2 text-3xl text-white/30">+</p>
                      <select
                        onChange={(e) => addCar(e.target.value)}
                        value=""
                        className="rounded-lg border border-white/10 bg-ink-900 px-2 py-1.5 text-xs outline-none focus:border-brand-500"
                      >
                        <option value="">Agregar vehículo</option>
                        {available.map((v) => (
                          <option key={v.slug} value={v.slug}>
                            {v.brand} {v.model} {v.year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr key={row.label} className={ri % 2 ? "bg-white/[0.02]" : ""}>
                <td className="p-3 text-sm font-medium text-white/60">{row.label}</td>
                {cars.map((v) => (
                  <td key={v.slug} className="p-3 text-sm">
                    {row.get(v)}
                  </td>
                ))}
                {selected.length < 3 && <td />}
              </tr>
            ))}
            <tr>
              <td className="p-3" />
              {cars.map((v) => (
                <td key={v.slug} className="p-3">
                  <Link
                    href={`/vehiculo/${v.slug}`}
                    className="block rounded-lg bg-brand-500 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-400"
                  >
                    Ver detalle
                  </Link>
                </td>
              ))}
              {selected.length < 3 && <td />}
            </tr>
          </tbody>
        </table>
      </div>

      {cars.length === 0 && (
        <p className="mt-8 text-center text-white/40">
          Agrega vehículos para comenzar a comparar.
        </p>
      )}
    </main>
  );
}
