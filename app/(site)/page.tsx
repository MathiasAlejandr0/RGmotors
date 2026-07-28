import Link from "next/link";
import { vehicles, formatCLP } from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";

export default function Home() {
  const featured = vehicles.filter((v) => v.featured).slice(0, 3);

  return (
    <main>
      {/* Hero */}
      <section className="hero-bg relative overflow-hidden border-b border-white/10">
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs text-brand-300">
              +450 vehículos con inspección y garantía
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              La nueva forma de comprar tu próximo{" "}
              <span className="text-brand-400">vehículo.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/60">
              Explora, simula tu financiamiento y reserva tu auto 100% online.
              Con total transparencia y respaldo en cada paso.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-400"
              >
                Ver catálogo
              </Link>
              <Link
                href="/simulador"
                className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white/90 transition hover:bg-white/5"
              >
                Solicitar crédito
              </Link>
            </div>
          </div>

          <div className="animate-fade-up">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cars/hero-suv.png"
              alt="Vehículo destacado RG Motors"
              className="w-full drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Feature strip */}
        <div className="relative border-t border-white/10 bg-ink-900/60">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-4 py-6 text-center sm:grid-cols-3 lg:grid-cols-5">
            <Stat icon="🚗" title="+450 autos" text="disponibles" />
            <Stat icon="⚡" title="Financiamiento" text="inmediato" />
            <Stat icon="🛡️" title="Compra" text="100% segura" />
            <Stat icon="🔄" title="Tours 360°" text="exterior e interior" />
            <Stat icon="⭐" title="Reserva" text="online" />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Vehículos destacados</h2>
            <p className="text-white/50">Seleccionados por su relación precio–calidad.</p>
          </div>
          <Link
            href="/catalogo"
            className="text-sm font-medium text-brand-400 hover:text-brand-300"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v) => (
            <VehicleCard key={v.slug} vehicle={v} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-white/10 bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold">
            Comprar tu auto nunca fue tan fácil
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <Step n="1" title="Explora" text="Filtra entre cientos de autos con inspección de 150 puntos." />
            <Step n="2" title="Revisa en 360°" text="Míralo por dentro y por fuera desde tu casa, sin ir a terreno." />
            <Step n="3" title="Simula tu crédito" text="Conoce tu cuota al instante, con CAE y costo total transparente." />
            <Step n="4" title="Reserva online" text="Bloquéalo pagando una parte por la web. 100% reembolsable." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/15 to-transparent p-8 text-center sm:p-12">
          <h2 className="text-3xl font-bold">¿Listo para encontrar tu auto?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/60">
            Explora nuestro catálogo con experiencia 360° y financia tu compra
            en minutos.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-block rounded-xl bg-brand-500 px-8 py-3 font-semibold text-white transition hover:bg-brand-400"
          >
            Explorar catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="px-2 py-2">
      <div className="text-xl">{icon}</div>
      <p className="mt-1 text-sm font-semibold">{title}</p>
      <p className="text-xs text-white/50">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-6">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 font-bold text-white">
        {n}
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-white/60">{text}</p>
    </div>
  );
}
