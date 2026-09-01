import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getVehicle,
  vehicles,
  formatCLP,
  specsOf,
  estimateMonthly,
  spinFramesOf,
} from "@/lib/vehicles";
import { getVehicles, getVehicleBySlug } from "@/lib/server/vehiclesStore";
import { asset } from "@/lib/asset";
import VehicleViewer from "@/components/VehicleViewer";
import CuotaSimulator from "@/components/CuotaSimulator";
import VehicleHealthCard from "@/components/VehicleHealthCard";
import VehicleActionButtons from "@/components/VehicleActionButtons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = (await getVehicleBySlug(slug)) || getVehicle(slug);
  if (!v) return { title: "Vehículo no encontrado | RG Motors" };

  return {
    title: `${v.brand} ${v.model} ${v.year} — ${formatCLP(v.price)} | RG Motors`,
    description: `${v.brand} ${v.model} ${v.version} año ${v.year} con ${v.km.toLocaleString("es-CL")} km. Inspección de 150 puntos y garantía RG Motors. Fotografías reales y simulación online.`,
    openGraph: {
      title: `${v.brand} ${v.model} ${v.year} | RG Motors`,
      description: `Precio: ${formatCLP(v.price)} · ${v.km.toLocaleString("es-CL")} km · ${v.fuel} · ${v.transmission}`,
      images: [asset(v.image)],
    },
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = (await getVehicleBySlug(slug)) || getVehicle(slug);
  if (!v) notFound();

  const allVehicles = await getVehicles().catch(() => vehicles);
  const publicVehicles = allVehicles.filter(v => v.gallery && v.gallery.length > 0);
  const monthly = estimateMonthly(v.price);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <nav className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/50 backdrop-blur-md mb-3">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>›</span>
            <Link href="/catalogo" className="hover:text-white transition-colors">Catálogo</Link>
            <span>›</span>
            <span className="text-white/90 font-semibold">{v.brand} {v.model}</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            {v.brand} {v.model} <span className="text-white/50 font-normal text-2xl">· {v.year}</span>
          </h1>
          <p className="text-xs text-white/50 mt-1">{v.version} · {v.location}</p>
        </div>

        {/* Main Price Tag */}
        <div className="text-right">
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{formatCLP(v.price)}</p>
          <p className="text-xs text-white/50 mt-1">
            Desde <span className="text-brand-300 font-semibold">{formatCLP(monthly)}</span>/mes
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
        {/* Left Column: Interactive Viewer + Health Report + Technical Specs */}
        <div className="space-y-8">
          <VehicleViewer
            image={asset(v.image)}
            gallery={v.gallery?.map(g => asset(g))}
            name={`${v.brand} ${v.model}`}
            slug={v.slug}
            spinFrames={spinFramesOf(v)}
          />

          {/* Health Diagnostics Report */}
          <VehicleHealthCard vehicleName={`${v.brand} ${v.model}`} />

          {/* Technical Specs Bento Grid */}
          <section className="apple-glass-card rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold tracking-tight text-white border-b border-white/10 pb-3">
              Ficha Técnica Certificada
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specsOf(v).map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{s.label}</p>
                  <p className="mt-1 text-xs font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Direct Actions & Financing Simulator */}
        <div className="space-y-6">
          {/* Quick Action Card with Trade-in, Reservation & WhatsApp */}
          <div className="apple-glass-card rounded-3xl p-6 space-y-5 border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-ink-950 to-black shadow-glow">
            <div>
              <span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-bold ${
                v.status === "En reserva"
                  ? "border-amber-400/30 bg-amber-400/15 text-amber-400"
                  : v.status === "Vendido"
                  ? "border-red-400/30 bg-red-400/15 text-red-400"
                  : "border-emerald-400/30 bg-emerald-400/15 text-emerald-400"
              }`}>
                {v.status === "En reserva"
                  ? "● En proceso de reserva"
                  : v.status === "Vendido"
                  ? "● Vehículo vendido"
                  : "✓ Disponible para entrega inmediata"}
              </span>
              <h3 className="mt-3 text-lg font-bold text-white tracking-tight">Consultar o financiar vehículo</h3>
              <p className="mt-1 text-xs text-white/55">
                Atención directa, simulación de crédito y tasación de tu auto en parte de pago.
              </p>
            </div>

            {/* Action Buttons Component */}
            <VehicleActionButtons vehicle={v} />

            <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-2 text-center text-[11px] text-white/60">
              <p>🛡️ Garantía de 6 meses</p>
              <p>📄 Documentación al día</p>
            </div>
          </div>

          {/* Credit Simulator */}
          <CuotaSimulator price={v.price} />
        </div>
      </div>

      {/* Similar vehicles */}
      <section className="mt-12 border-t border-white/[0.08] pt-8">
        <h2 className="mb-6 text-lg font-bold tracking-tight text-white">Vehículos similares disponibles</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {publicVehicles
            .filter((x) => x.slug !== v.slug && x.bodyType === v.bodyType)
            .slice(0, 3)
            .map((x) => (
              <Link
                key={x.slug}
                href={`/vehiculo/${x.slug}`}
                className="apple-glass-card group flex items-center gap-4 rounded-3xl p-3.5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(x.image)} alt={x.model} className="h-16 w-24 rounded-2xl object-cover" />
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                    {x.brand} {x.model}
                  </p>
                  <p className="text-xs font-semibold text-brand-300 mt-0.5">{formatCLP(x.price)}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
