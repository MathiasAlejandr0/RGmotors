import Link from "next/link";
import { asset } from "@/lib/asset";
import { getVehicles } from "@/lib/server/vehiclesStore";
import {
  filterPublicCatalog,
  pickFeaturedVehicles,
} from "@/lib/vehicles/publicCatalog";
import VehicleCard from "@/components/VehicleCard";
import RevealOnScroll from "@/components/RevealOnScroll";
import AppleCareTrustSection from "@/components/AppleCareTrustSection";
import ShowroomMapSection from "@/components/ShowroomMapSection";
import HeroExploreHint from "@/components/HeroExploreHint";
import TrustMarquee from "@/components/TrustMarquee";

export const dynamic = "force-dynamic";

export default async function Home() {
  const vehicles = await getVehicles();
  const publicVehicles = filterPublicCatalog(vehicles);
  const featured = pickFeaturedVehicles(vehicles, 6);

  return (
    <main className="relative overflow-hidden">
      {/* HERO — mockup cinematográfico + acabado */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset("/hero-l200-puerto-montt.png")}
          alt="Stock RG Motors Puerto Montt"
          className="rg-hero-media absolute inset-0 h-full w-full object-cover object-[82%_center] sm:object-[78%_center]"
        />
        {/* Más oscuro a la izquierda/abajo: el auto queda libre a la derecha */}
        <div className="rg-hero-vignette absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.72)_22%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0.05)_58%,transparent_72%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,transparent_18%,transparent_55%,rgba(6,7,10,0.95)_100%)]" />
        <div className="rg-grain" aria-hidden />

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-28 pt-28 sm:px-8 sm:pb-32 lg:px-10 lg:pb-36">
          <div className="rg-stagger w-full max-w-[22rem] sm:max-w-[28rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
              RG Motors · Puerto Montt
            </p>

            <h1 className="mt-4 text-[1.85rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-white drop-shadow-[0_6px_32px_rgba(0,0,0,0.9)] sm:text-[2.4rem] sm:leading-[1.18] lg:text-[2.65rem]">
              Tu próximo vehículo,
              <br />
              con financiamiento a tu medida
            </h1>

            <p className="mt-5 text-sm leading-relaxed text-white/78 drop-shadow-[0_2px_18px_rgba(0,0,0,0.8)] sm:text-[0.95rem]">
              Camionetas y autos con fotos reales de patio.
              <br />
              Visítalos en Puerto Montt y simula tu cuota con Autofin.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/catalogo"
                className="rg-btn-primary inline-flex min-w-[9.5rem] items-center justify-center rounded-lg px-7 py-3.5 text-sm font-bold text-white"
              >
                Ver catálogo
              </Link>
              <Link
                href="/simulador"
                className="rg-btn-ghost-light inline-flex min-w-[9.5rem] items-center justify-center rounded-lg px-7 py-3.5 text-sm font-bold"
              >
                Simular cuota
              </Link>
            </div>
          </div>
        </div>

        <HeroExploreHint />
      </section>

      <TrustMarquee />

      {/* DESTACADOS */}
      <section id="catalogo" className="relative scroll-mt-24 mx-auto max-w-7xl px-4 pb-16 pt-0 sm:px-6 sm:pb-20">
        <RevealOnScroll>
          <div className="mb-7 flex flex-col gap-2 pt-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Vehículos destacados
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Unidades seleccionadas por estado mecánico y estético.
              </p>
            </div>
            <Link href="/catalogo" className="rg-link text-sm font-semibold text-brand-300 hover:text-white">
              Ver catálogo completo
              <span className="rg-link-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </RevealOnScroll>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v, idx) => (
            <RevealOnScroll key={v.slug} delay={idx * 70}>
              <VehicleCard vehicle={v} />
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/catalogo"
            className="apple-btn-secondary inline-flex rounded-full px-8 py-3 text-sm font-semibold text-white"
          >
            Ver todos los {publicVehicles.length} vehículos →
          </Link>
        </div>
      </section>

      {/* PROCESO */}
      <section className="border-y border-white/[0.08] bg-[#0a0b10] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <RevealOnScroll>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-[#C9A84C] to-transparent" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#C9A84C]/90">
                Proceso
              </p>
            </div>
            <h2 className="mt-4 font-display text-[1.85rem] font-semibold uppercase tracking-[0.03em] text-white sm:text-[2.25rem]">
              Comprar en cuatro pasos
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/48">
              Del catálogo al showroom, con atención en Puerto Montt.
            </p>
          </RevealOnScroll>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <RevealOnScroll delay={60}>
              <Step n="1" title="Explora el stock" text="Filtra vehículos inspeccionados con ficha clara y fotos reales." />
            </RevealOnScroll>
            <RevealOnScroll delay={100}>
              <Step n="2" title="Revisa en detalle" text="Galería, 360° cuando está disponible e información técnica." />
            </RevealOnScroll>
            <RevealOnScroll delay={140}>
              <Step n="3" title="Simula tu cuota" text="Elige pie y plazo. Te contactamos en horario hábil el mismo día." />
            </RevealOnScroll>
            <RevealOnScroll delay={180}>
              <Step n="4" title="Visita el showroom" text="Coordinamos entrega o visita al patio en Puerto Montt." />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* SHOWROOM */}
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-16">
        <ShowroomMapSection />
      </section>

      {/* FINANCIAMIENTO + TRANSPARENCIA + CIERRE */}
      <RevealOnScroll>
        <AppleCareTrustSection />
      </RevealOnScroll>
    </main>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="group h-full border border-white/[0.08] bg-[#0e1016] px-5 py-5 transition duration-300 hover:border-[#C9A84C]/25 hover:bg-[#12151c]">
      <span className="font-display text-sm tracking-[0.18em] text-[#C9A84C]/80">{n.padStart(2, "0")}</span>
      <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[12.5px] leading-relaxed text-white/48">{text}</p>
    </div>
  );
}
