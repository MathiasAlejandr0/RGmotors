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
    <main className="mx-auto max-w-7xl px-4 py-6">
      <nav className="text-sm text-white/40">
        <Link href="/" className="hover:text-white">Inicio</Link>
        {" › "}
        <Link href="/catalogo" className="hover:text-white">Catálogo</Link>
        {" › "}
        <span className="text-white/70">{v.brand} {v.model}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: viewer + specs */}
        <div>
          <VehicleViewer
            image={asset(v.image)}
            name={`${v.brand} ${v.model}`}
            slug={v.slug}
            spinFrames={spinFramesOf(v)}
          />

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Ficha técnica</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specsOf(v).map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
                  <p className="text-xs text-white/40">{s.label}</p>
                  <p className="mt-1 font-semibold">{s.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Características destacadas</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {(v.highlights || []).map((h) => (
                <li key={h} className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-800/60 px-4 py-3 text-sm text-white/70">
                  <span className="text-emerald-400">✓</span> {h}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right: info + credit */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-brand-300">
              {v.year} · {v.km.toLocaleString("es-CL")} km · {v.location}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{v.brand} {v.model}</h1>
            <p className="text-white/60">{v.version}</p>
            <p className="mt-3 text-4xl font-extrabold">{formatCLP(v.price)}</p>
          </div>

          {/* Credit sidebar */}
          <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <h3 className="text-lg font-semibold">Solicita tu crédito</h3>
            <p className="mt-1 text-sm text-white/50">Simulación con pie 20% a 48 cuotas.</p>
            <div className="mt-4 rounded-xl bg-ink-900 p-4">
              <p className="text-sm text-white/50">Cuota mensual estimada</p>
              <p className="mt-1 text-3xl font-bold text-brand-300">{formatCLP(monthly)}</p>
            </div>
            <div className="mt-4 space-y-2">
              <Link
                href={`/reserva/${v.slug}`}
                className="block rounded-xl bg-brand-500 py-3 text-center font-semibold text-white transition hover:bg-brand-400"
              >
                Reservar ahora
              </Link>
              <Link
                href={`/prueba-manejo/${v.slug}`}
                className="block rounded-xl border border-white/15 py-3 text-center font-medium text-white/90 transition hover:bg-white/5"
              >
                Agendar prueba de manejo
              </Link>
              <a
                href={whatsappLink(
                  `Hola RG Motors, me interesa el ${v.brand} ${v.model} ${v.year} (${v.version}) a ${formatCLP(v.price)}. ¿Me pueden dar más información?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-[#25D366] py-3 text-center font-semibold text-white transition hover:brightness-110"
              >
                Consultar por WhatsApp
              </a>
              <a
                href="#simulador"
                className="block rounded-xl border border-white/15 py-3 text-center font-medium text-white/90 transition hover:bg-white/5"
              >
                Simular crédito en detalle
              </a>
            </div>
          </div>

          <div id="simulador">
            <CuotaSimulator price={v.price} />
          </div>

          <div className="grid gap-3">
            <Trust icon="🔍" title="Inspección de 150 puntos" />
            <Trust icon="📄" title="Historial verificado sin deudas" />
            <Trust icon="🛡️" title="Garantía RG Motors de 6 meses" />
          </div>
        </div>
      </div>

      {/* Similar */}
      <section className="mt-14">
        <h2 className="mb-4 text-xl font-semibold">También te puede interesar</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {vehicles
            .filter((x) => x.slug !== v.slug && x.bodyType === v.bodyType)
            .slice(0, 3)
            .map((x) => (
              <Link
                key={x.slug}
                href={`/vehiculo/${x.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800/60 p-3 transition hover:border-brand-500/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(x.image)} alt={x.model} className="h-16 w-24 rounded-lg object-cover" />
                <div>
                  <p className="font-medium">{x.brand} {x.model}</p>
                  <p className="text-sm text-brand-300">{formatCLP(x.price)}</p>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}

function Trust({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-800/40 px-4 py-3">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-white/70">{title}</span>
    </div>
  );
}
