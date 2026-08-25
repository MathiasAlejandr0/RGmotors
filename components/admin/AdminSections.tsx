"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { Vehicle, formatCLP, estimateMonthly } from "@/lib/vehicles";
import VehicleEditorModal from "./VehicleEditorModal";
import { Reservation } from "@/lib/server/reservationsStore";
import { CreditApplication } from "@/lib/server/creditsStore";
import { SystemSettings } from "@/lib/server/settingsStore";

const STATUS_BADGES = {
  Disponible: "bg-emerald-400/15 text-emerald-300 border-emerald-500/30",
  "En reserva": "bg-amber-400/15 text-amber-300 border-amber-500/30",
  Vendido: "bg-red-400/15 text-red-300 border-red-500/30",
  Borrador: "bg-white/10 text-white/50 border-white/20",
  Pagada: "bg-emerald-400/15 text-emerald-300 border-emerald-500/30",
  "En proceso": "bg-amber-400/15 text-amber-300 border-amber-500/30",
  Cancelada: "bg-red-400/15 text-red-300 border-red-500/30",
  Entregado: "bg-blue-400/15 text-blue-300 border-blue-500/30",
  "Pre-aprobado": "bg-emerald-400/15 text-emerald-300 border-emerald-500/30",
  Aprobado: "bg-emerald-400/15 text-emerald-300 border-emerald-500/30",
  "En evaluación": "bg-amber-400/15 text-amber-300 border-amber-500/30",
  Rechazado: "bg-red-400/15 text-red-300 border-red-500/30",
} as const;

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-white">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

/** 
 * SECCIÓN 1: INVENTARIO DINÁMICO CON CRUD COMPLETO
 */
export function VehiclesSection({
  onManagePhotos,
}: {
  onManagePhotos?: (slug: string) => void;
}) {
  const [vehicleList, setVehicleList] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicleList(data.vehicles || []);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (v: Vehicle) => {
    const copySlug = `${v.slug}-copia-${Date.now().toString().slice(-4)}`;
    const copyVehicle: Vehicle = {
      ...v,
      slug: copySlug,
      model: `${v.model} (Copia)`,
      featured: false,
      status: "Borrador",
    };

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copyVehicle),
      });
      if (res.ok) {
        fetchVehicles();
      }
    } catch {
      alert("Error al duplicar vehículo.");
    }
  };

  const handleDelete = async (slug: string, model: string) => {
    if (!confirm(`¿Estás seguro de eliminar el vehículo "${model}" del catálogo?`)) return;
    try {
      const res = await fetch(`/api/vehicles/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setVehicleList((prev) => prev.filter((v) => v.slug !== slug));
      } else {
        alert("No se pudo eliminar el vehículo.");
      }
    } catch {
      alert("Error de conexión al eliminar.");
    }
  };

  const handleQuickStatus = async (v: Vehicle, newStatus: Vehicle["status"]) => {
    try {
      const res = await fetch(`/api/vehicles/${v.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setVehicleList((prev) =>
          prev.map((item) => (item.slug === v.slug ? { ...item, status: newStatus } : item))
        );
      }
    } catch {
      alert("Error al actualizar estado.");
    }
  };

  const filtered = vehicleList.filter((v) => {
    const matchSearch =
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.version.toLowerCase().includes(search.toLowerCase()) ||
      String(v.year).includes(search);
    const matchStatus =
      filterStatus === "all" || (v.status || "Disponible") === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Inventario de Vehículos</h2>
          <p className="text-xs text-white/50">
            {vehicleList.length} vehículos en base de datos · {vehicleList.filter((v) => v.status === "Disponible").length} disponibles
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onManagePhotos && (
            <button
              onClick={() => onManagePhotos(vehicleList[0]?.slug || "")}
              className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-2.5 text-xs font-bold text-brand-300 transition hover:bg-brand-500/20"
            >
              📸 Gestor de Fotos & 360°
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="apple-btn-primary rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-glow"
          >
            + Publicar Vehículo
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/10 bg-ink-900/60 p-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar por marca, modelo o año…"
            className="w-full rounded-xl border border-white/15 bg-ink-950 px-4 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-brand-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-xs text-white/40 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Filtrar:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-white/15 bg-ink-950 px-3 py-2 text-xs font-medium text-white outline-none focus:border-brand-500"
          >
            <option value="all">Todos los estados</option>
            <option value="Disponible">🟢 Disponibles</option>
            <option value="En reserva">🟡 En reserva</option>
            <option value="Vendido">🔴 Vendidos</option>
            <option value="Borrador">⚪ Borradores</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <Panel title="Lista de Inventario">
        {isLoading ? (
          <div className="grid h-40 place-items-center text-xs text-white/40">
            <span className="animate-spin text-lg">⚙</span> Cargando inventario…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40">
            No se encontraron vehículos con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-sm">
              <thead className="text-left text-white/40">
                <tr className="border-b border-white/10">
                  <th className="pb-2.5 font-medium">Vehículo</th>
                  <th className="pb-2.5 font-medium">Año / Km</th>
                  <th className="pb-2.5 font-medium">Precio</th>
                  <th className="pb-2.5 font-medium">360°</th>
                  <th className="pb-2.5 font-medium">Estado</th>
                  <th className="pb-2.5 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr key={v.slug} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset(v.image)}
                          alt={v.model}
                          className="h-11 w-16 rounded-xl object-cover border border-white/10 shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-white">
                            {v.brand} {v.model}
                          </p>
                          <p className="text-xs text-white/40">{v.version} · {v.bodyType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-white/70">
                      <p className="font-medium text-white">{v.year}</p>
                      <p className="text-xs text-white/40">{v.km.toLocaleString("es-CL")} km</p>
                    </td>
                    <td className="py-3 text-white/70">
                      <p className="font-bold text-brand-300">{formatCLP(v.price)}</p>
                      <p className="text-[10px] text-white/40">Est. {formatCLP(estimateMonthly(v.price))}/m</p>
                    </td>
                    <td className="py-3">
                      {v.spin && v.spin.count > 0 ? (
                        <span className="rounded-full bg-emerald-400/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs text-emerald-300 font-medium">
                          360° ({v.spin.count})
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/40">
                          Sin 360
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <select
                        value={v.status || "Disponible"}
                        onChange={(e) => handleQuickStatus(v, e.target.value as any)}
                        className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none cursor-pointer ${
                          STATUS_BADGES[v.status || "Disponible"]
                        }`}
                      >
                        <option value="Disponible">🟢 Disponible</option>
                        <option value="En reserva">🟡 En reserva</option>
                        <option value="Vendido">🔴 Vendido</option>
                        <option value="Borrador">⚪ Borrador</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-500 hover:text-white transition"
                          title="Editar detalles del auto"
                        >
                          ✏️ Editar
                        </button>
                        {onManagePhotos && (
                          <button
                            onClick={() => onManagePhotos(v.slug)}
                            className="rounded-lg bg-ink-700 px-2.5 py-1 text-xs font-medium text-white/80 hover:bg-brand-500 hover:text-white transition"
                            title="Gestionar fotos y giros 360°"
                          >
                            📷 Fotos
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(v)}
                          className="rounded-lg bg-white/5 px-2 py-1 text-xs font-medium text-white/60 hover:bg-white/15 hover:text-white transition"
                          title="Duplicar auto"
                        >
                          📑
                        </button>
                        <button
                          onClick={() => handleDelete(v.slug, `${v.brand} ${v.model}`)}
                          className="rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-300 hover:bg-red-500 hover:text-white transition"
                          title="Eliminar del catálogo"
                        >
                          🗑️
                        </button>
                        <Link
                          href={`/vehiculo/${v.slug}`}
                          target="_blank"
                          className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-brand-300 hover:underline"
                        >
                          ↗ Ficha
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Editor Modal */}
      <VehicleEditorModal
        vehicle={editingVehicle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => {
          fetchVehicles();
        }}
      />
    </div>
  );
}

/** 
 * SECCIÓN 2: GESTIÓN CRM DE RESERVAS CON WHATSAPP DIRECTO
 */
export function ReservationsSection() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = async (id: string, newStatus: Reservation["status"]) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch {
      alert("Error al actualizar estado de la reserva.");
    }
  };

  const totalAmount = reservations
    .filter((r) => r.status === "Pagada")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-xs text-white/50">Reservas registradas</p>
          <p className="mt-1 text-2xl font-bold text-white">{reservations.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-xs text-white/50">Abonos pagados</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {reservations.filter((r) => r.status === "Pagada").length}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-xs text-white/50">Monto total en garantía</p>
          <p className="mt-1 text-2xl font-bold text-brand-300">{formatCLP(totalAmount)}</p>
        </div>
      </div>

      <Panel title="Gestión de Reservas Online">
        {isLoading ? (
          <div className="grid h-32 place-items-center text-xs text-white/40">
            Cargando reservas…
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40">
            No hay reservas registradas aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="text-left text-white/40">
                <tr className="border-b border-white/10">
                  <th className="pb-2.5 font-medium">ID / Fecha</th>
                  <th className="pb-2.5 font-medium">Cliente</th>
                  <th className="pb-2.5 font-medium">Vehículo</th>
                  <th className="pb-2.5 font-medium">Monto</th>
                  <th className="pb-2.5 font-medium">Estado</th>
                  <th className="pb-2.5 font-medium text-right">Contacto Rápido</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => {
                  const cleanPhone = r.phone.replace(/[^0-9]/g, "");
                  const msg = `Hola ${r.clientName}, te contactamos de RG Motors respecto a tu reserva ${r.id} del vehículo ${r.vehicleSlug}. ¿Cómo estás?`;
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

                  return (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                      <td className="py-3">
                        <p className="font-semibold text-white">{r.id}</p>
                        <p className="text-[11px] text-white/40">
                          {new Date(r.date).toLocaleDateString("es-CL")}
                        </p>
                      </td>
                      <td className="py-3">
                        <p className="font-bold text-white">{r.clientName}</p>
                        <p className="text-xs text-white/40">{r.email || r.phone}</p>
                      </td>
                      <td className="py-3">
                        <Link href={`/vehiculo/${r.vehicleSlug}`} className="font-medium text-brand-300 hover:underline">
                          {r.vehicleSlug}
                        </Link>
                        <p className="text-[11px] text-white/40">Método: {r.method}</p>
                      </td>
                      <td className="py-3 font-bold text-white">{formatCLP(r.amount)}</td>
                      <td className="py-3">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value as any)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer ${
                            STATUS_BADGES[r.status]
                          }`}
                        >
                          <option value="Pagada">🟢 Pagada</option>
                          <option value="En proceso">🟡 En proceso</option>
                          <option value="Entregado">🔵 Entregado</option>
                          <option value="Cancelada">🔴 Cancelada</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        {r.phone ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 px-3 py-1.5 text-xs font-bold text-[#25D366] hover:bg-[#25D366] hover:text-white transition"
                          >
                            <span>💬</span> WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-white/40">Sin teléfono</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

/** 
 * SECCIÓN 3: SOLICITUDES DE CRÉDITO Y EVALUACIONES
 */
export function CreditsSection() {
  const [credits, setCredits] = useState<CreditApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits || []);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const handleStatusChange = async (id: string, newStatus: CreditApplication["status"]) => {
    try {
      const res = await fetch(`/api/credits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCredits((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch {
      alert("Error al actualizar crédito.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-xs text-white/50">Solicitudes totales</p>
          <p className="mt-1 text-2xl font-bold text-white">{credits.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-xs text-white/50">Tasa de aprobación</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {credits.length
              ? Math.round(
                  (credits.filter((c) => c.status === "Pre-aprobado" || c.status === "Aprobado").length /
                    credits.length) *
                    100
                )
              : 0}
            %
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-xs text-white/50">En evaluación activa</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {credits.filter((c) => c.status === "En evaluación").length}
          </p>
        </div>
      </div>

      <Panel title="Solicitudes de Financiamiento">
        {isLoading ? (
          <div className="grid h-32 place-items-center text-xs text-white/40">
            Cargando solicitudes…
          </div>
        ) : credits.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40">
            No hay solicitudes de crédito registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="text-left text-white/40">
                <tr className="border-b border-white/10">
                  <th className="pb-2.5 font-medium">Cliente</th>
                  <th className="pb-2.5 font-medium">Vehículo</th>
                  <th className="pb-2.5 font-medium">Pie / Plazo</th>
                  <th className="pb-2.5 font-medium">Cuota Est.</th>
                  <th className="pb-2.5 font-medium">Estado</th>
                  <th className="pb-2.5 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((c) => {
                  const cleanPhone = c.phone.replace(/[^0-9]/g, "");
                  const msg = `Hola ${c.clientName}, te contactamos de RG Motors con respecto a tu simulación de financiamiento para el ${c.vehicleSlug}. Tu estado actual es: ${c.status}. ¿Cuándo podemos llamarte?`;
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

                  return (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                      <td className="py-3">
                        <p className="font-bold text-white">{c.clientName}</p>
                        <p className="text-xs text-white/40">{c.phone || c.email}</p>
                      </td>
                      <td className="py-3 text-white/70">
                        <Link href={`/vehiculo/${c.vehicleSlug}`} className="text-brand-300 hover:underline">
                          {c.vehicleSlug}
                        </Link>
                      </td>
                      <td className="py-3 text-white/70">
                        {c.downPct}% pie · {c.term} meses
                      </td>
                      <td className="py-3 font-bold text-brand-300">
                        {formatCLP(c.monthlyEstimate)}
                      </td>
                      <td className="py-3">
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value as any)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none cursor-pointer ${
                            STATUS_BADGES[c.status]
                          }`}
                        >
                          <option value="En evaluación">🟡 En evaluación</option>
                          <option value="Pre-aprobado">🟢 Pre-aprobado</option>
                          <option value="Aprobado">🟢 Aprobado</option>
                          <option value="Rechazado">🔴 Rechazado</option>
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        {c.phone && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 transition"
                          >
                            <span>📲</span> Notificar
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

/** 
 * SECCIÓN 4: BASE DE CLIENTES Y LEADS
 */
export function ClientsSection() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/track")
      .then((r) => (r.ok ? r.json() : { leads: [] }))
      .then((data) => setLeads(data.leads || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <Panel title="Clientes y Leads Capturados">
        {leads.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40">
            Aún no hay leads capturados. Los contactos ingresados en el chatbot o formularios aparecerán aquí.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-white/40">
                <tr className="border-b border-white/10">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Contacto</th>
                  <th className="pb-2 font-medium">Interés / Carrocería</th>
                  <th className="pb-2 font-medium">Presupuesto</th>
                  <th className="pb-2 font-medium text-right">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const clean = (l.contact || "").replace(/[^0-9]/g, "");
                  const waUrl = clean
                    ? `https://wa.me/${clean}?text=${encodeURIComponent("Hola! Te contactamos de RG Motors.")}`
                    : null;

                  return (
                    <tr key={l.id} className="border-b border-white/5">
                      <td className="py-3 text-xs text-white/50">
                        {new Date(l.updatedAt || l.createdAt).toLocaleDateString("es-CL")}
                      </td>
                      <td className="py-3 font-semibold text-white">
                        {l.contact || l.name || "Lead Web Anónimo"}
                      </td>
                      <td className="py-3 text-white/70">
                        {l.bodyType || (l.models && l.models.join(", ")) || "Consultando"}
                      </td>
                      <td className="py-3 font-bold text-brand-300">
                        {l.budget ? formatCLP(l.budget) : "—"}
                      </td>
                      <td className="py-3 text-right">
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#25D366]/20 px-2.5 py-1 text-xs text-[#25D366] hover:bg-[#25D366] hover:text-white transition"
                          >
                            <span>💬</span> Chat
                          </a>
                        ) : (
                          <span className="text-xs text-white/30">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

/** 
 * SECCIÓN 5: CONFIGURACIÓN GLOBAL DEL NEGOCIO (PERSISTENTE)
 */
export function ConfigSection() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch {
      alert("Error al guardar la configuración.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-white/40">Cargando configuración…</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {savedSuccess && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-xs font-bold text-emerald-300 animate-fade-in flex items-center justify-between">
          <span>✓ ¡Configuración de la empresa y preferencias guardadas exitosamente!</span>
          <span className="text-white/60">Los cambios ya están activos en la web.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Datos de contacto */}
        <Panel title="Datos Oficiales de la Empresa">
          <div className="space-y-3.5 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Nombre Comercial</label>
              <input
                type="text"
                value={settings.company.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    company: { ...settings.company, name: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Teléfono Visible</label>
                <input
                  type="text"
                  value={settings.company.phoneDisplay}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, phoneDisplay: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">WhatsApp (sin +)</label>
                <input
                  type="text"
                  value={settings.company.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      company: { ...settings.company, whatsapp: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Correo Electrónico</label>
              <input
                type="email"
                value={settings.company.email}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    company: { ...settings.company, email: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Dirección de Sucursal</label>
              <input
                type="text"
                value={settings.company.address}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    company: { ...settings.company, address: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Horarios de Atención</label>
              <input
                type="text"
                value={settings.company.hours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    company: { ...settings.company, hours: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2 text-sm text-white focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </Panel>

        {/* Preferencias y simulador */}
        <Panel title="Parámetros Comerciales & Simulador">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Monto Abono Reserva ($)</label>
                <input
                  type="number"
                  step={10000}
                  value={settings.preferences.reserveAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preferences: {
                        ...settings.preferences,
                        reserveAmount: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2 text-sm text-white font-bold text-brand-300 focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Tasa Interés Mensual</label>
                <input
                  type="number"
                  step={0.001}
                  value={settings.preferences.monthlyInterestRate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preferences: {
                        ...settings.preferences,
                        monthlyInterestRate: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <ul className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
              <li className="flex items-center justify-between rounded-xl bg-ink-950 p-3">
                <span className="text-white font-medium">Habilitar Giros 360° en Catálogo</span>
                <input
                  type="checkbox"
                  checked={settings.preferences.showSpin360}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, showSpin360: e.target.checked },
                    })
                  }
                  className="h-5 w-5 accent-brand-500 rounded cursor-pointer"
                />
              </li>
              <li className="flex items-center justify-between rounded-xl bg-ink-950 p-3">
                <span className="text-white font-medium">Activar Chatbot Asesor IA</span>
                <input
                  type="checkbox"
                  checked={settings.preferences.enableChatbot}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, enableChatbot: e.target.checked },
                    })
                  }
                  className="h-5 w-5 accent-brand-500 rounded cursor-pointer"
                />
              </li>
              <li className="flex items-center justify-between rounded-xl bg-ink-950 p-3">
                <span className="text-white font-medium">Permitir Reservas Online ($)</span>
                <input
                  type="checkbox"
                  checked={settings.preferences.enableOnlineReservation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, enableOnlineReservation: e.target.checked },
                    })
                  }
                  className="h-5 w-5 accent-brand-500 rounded cursor-pointer"
                />
              </li>
            </ul>
          </div>
        </Panel>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="apple-btn-primary rounded-xl px-8 py-3 text-sm font-bold text-white shadow-glow disabled:opacity-50"
        >
          {isSaving ? "Guardando cambios…" : "💾 Guardar Todos los Cambios"}
        </button>
      </div>
    </form>
  );
}
