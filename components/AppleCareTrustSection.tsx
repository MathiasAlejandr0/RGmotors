"use client";

import Link from "next/link";

export default function AppleCareTrustSection() {
  const pillars = [
    {
      icon: "🔧",
      title: "Inspección mecánica 150 puntos",
      badge: "Usados seleccionados",
      desc: "Revisamos cada unidad antes de publicarla. Los vehículos usados se venden en el estado inspeccionado; RG Motors no ofrece garantía mecánica postventa.",
    },
    {
      icon: "📄",
      title: "Certificación Legal & Autofact",
      badge: "Documentación al día",
      desc: "Cada vehículo cuenta con informe de dominio vigente, kilometraje auditado por escáner y cero anotaciones, deudas o multas pendientes.",
    },
    {
      icon: "🚚",
      title: "Entrega en showroom",
      badge: "Puerto Montt",
      desc: "Coordinamos la entrega en nuestro showroom de Puerto Montt con atención personalizada y transferencia ágil.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="apple-glass-card relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-white/10 space-y-8 shadow-apple-card">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3.5 py-1 text-xs font-semibold text-brand-300">
              Transparencia RG Motors · Vehículos usados
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Transparencia total en cada etapa de tu compra
            </h2>
          </div>
          <Link
            href="/contacto"
            className="apple-btn-secondary rounded-full px-5 py-2.5 text-xs font-semibold text-white"
          >
            Conocer sucursales y showroom →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((g) => (
            <div
              key={g.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{g.icon}</span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  {g.badge}
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-white tracking-tight">{g.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/60">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
