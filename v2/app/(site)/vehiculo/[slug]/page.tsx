import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getVehicle,
  vehicles,
  formatCLP,
  specsOf,
  estimateMonthly,
  spinFramesOf,
} from "@/lib/vehicles";
import { asset } from "@/lib/asset";
import { whatsappLink } from "@/lib/company";
import VehicleViewer from "@/components/VehicleViewer";
import CuotaSimulator from "@/components/CuotaSimulator";

import VehicleHealthCard from "@/components/VehicleHealthCard";

export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = getVehicle(slug);
  if (!v) notFound();

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
          {/* Quick Action Card */}
          <div className="apple-glass-card rounded-3xl p-6 space-y-5 border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-ink-950 to-black shadow-glow">
            <div>
              <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-400">
                ✓ Disponible para entrega inmediata
              </span>
              <h3 className="mt-3 text-lg font-bold text-white tracking-tight">Comprar o reservar vehículo</h3>
              <p className="mt-1 text-xs text-white/55">
                Abono 100% reembolsable de $200.000 para bloquear el vehículo por 48 hrs.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href={`/reserva/${v.slug}`}
                className="apple-btn-primary block w-full rounded-full py-3.5 text-center text-xs font-bold text-white shadow-glow"
              >
                Reservar online ($200.000 abono)
              </Link>
              <Link
                href={`/prueba-manejo/${v.slug}`}
                className="apple-btn-secondary block w-full rounded-full py-3 text-center text-xs font-semibold text-white"
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
            </div>

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
          {vehicles
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
                  <p className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">{x.brand} {x.model}</p>
                  <p className="text-xs font-semibold text-brand-300 mt-0.5">{formatCLP(x.price)}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}

function Trust({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 backdrop-blur-md">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs font-bold text-white">{title}</p>
        <p className="text-[11px] text-white/50">{text}</p>
      </div>
    </div>
  );
}


