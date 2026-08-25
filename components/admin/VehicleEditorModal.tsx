"use client";

import { useState, useEffect } from "react";
import { Vehicle, BRANDS, BODY_TYPES, FUELS, TRANSMISSIONS } from "@/lib/vehicles";
import { asset } from "@/lib/asset";

type Props = {
  vehicle: Vehicle | null; // null = creating new
  isOpen: boolean;
  onClose: () => void;
  onSaved: (vehicle: Vehicle) => void;
};

const DEFAULT_HIGHLIGHTS = [
  "Inspección de 150 puntos aprobada",
  "Mantenciones al día en taller certificado",
  "Garantía RG Motors de 6 meses",
  "Sin choques ni observaciones de historial",
];

export default function VehicleEditorModal({
  vehicle,
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const isEditing = !!vehicle;
  const [activeTab, setActiveTab] = useState<"general" | "engine" | "media" | "status">("general");

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    brand: "Toyota",
    model: "",
    version: "2.0",
    year: new Date().getFullYear(),
    price: 15990000,
    km: 30000,
    fuel: "Bencina",
    transmission: "Automática",
    bodyType: "SUV",
    location: "Santiago, RM",
    image: "/cars/toyota-rav4-2022.jpg",
    engine: "2.0L",
    power: "170 HP",
    traction: "4x2",
    doors: 5,
    owners: 1,
    featured: false,
    status: "Disponible",
    highlights: [...DEFAULT_HIGHLIGHTS],
    spin: undefined,
  });

  const [hasSpin, setHasSpin] = useState<boolean>(false);
  const [spinCount, setSpinCount] = useState<number>(36);
  const [highlightInput, setHighlightInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (vehicle) {
      setFormData({ ...vehicle });
      setHasSpin(!!vehicle.spin && vehicle.spin.count > 0);
      setSpinCount(vehicle.spin?.count || 36);
    } else {
      setFormData({
        brand: "Toyota",
        model: "",
        version: "2.0",
        year: new Date().getFullYear(),
        price: 15990000,
        km: 30000,
        fuel: "Bencina",
        transmission: "Automática",
        bodyType: "SUV",
        location: "Santiago, RM",
        image: "/cars/toyota-rav4-2022.jpg",
        engine: "2.0L",
        power: "170 HP",
        traction: "4x2",
        doors: 5,
        owners: 1,
        featured: false,
        status: "Disponible",
        highlights: [...DEFAULT_HIGHLIGHTS],
      });
      setHasSpin(false);
      setSpinCount(36);
    }
    setActiveTab("general");
    setErrorMsg("");
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Vehicle, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddHighlight = () => {
    const text = highlightInput.trim();
    if (!text) return;
    const current = formData.highlights || [];
    setFormData((prev) => ({ ...prev, highlights: [...current, text] }));
    setHighlightInput("");
  };

  const handleRemoveHighlight = (idx: number) => {
    const current = formData.highlights || [];
    setFormData((prev) => ({
      ...prev,
      highlights: current.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.model || !formData.year || !formData.price) {
      setErrorMsg("Por favor completa los campos obligatorios (Marca, Modelo, Año y Precio).");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    const payload: Partial<Vehicle> = {
      ...formData,
      spin: hasSpin ? { count: spinCount, ext: "jpg" } : undefined,
    };

    try {
      const url = isEditing ? `/api/vehicles/${vehicle.slug}` : "/api/vehicles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo guardar el vehículo.");
      }

      onSaved(data.vehicle);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-ink-900 shadow-2xl overflow-hidden my-8 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-ink-800/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
              {isEditing ? "Editar Vehículo del Catálogo" : "Publicar Nuevo Vehículo"}
            </span>
            <h2 className="text-xl font-extrabold text-white">
              {formData.brand} {formData.model || "Nuevo Auto"} {formData.year && `· ${formData.year}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-ink-950 px-6 gap-2 pt-2">
          {[
            { id: "general", label: "1. Datos Básicos", icon: "📋" },
            { id: "engine", label: "2. Motor & Specs", icon: "⚙️" },
            { id: "media", label: "3. Fotos & Galería", icon: "📸" },
            { id: "status", label: "4. Estado & 360°", icon: "🔄" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-300 bg-brand-500/10 rounded-t-lg"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {errorMsg && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              ❌ {errorMsg}
            </div>
          )}

          {/* TAB 1: DATOS BÁSICOS */}
          {activeTab === "general" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Marca *</label>
                <input
                  type="text"
                  list="brands-list"
                  value={formData.brand || ""}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="Ej: Toyota, Mazda, Ford"
                  required
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                />
                <datalist id="brands-list">
                  {BRANDS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Modelo *</label>
                <input
                  type="text"
                  value={formData.model || ""}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="Ej: RAV4, CX-5, Ranger"
                  required
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Versión / Paquete</label>
                <input
                  type="text"
                  value={formData.version || ""}
                  onChange={(e) => handleChange("version", e.target.value)}
                  placeholder="Ej: 2.5 Hybrid AWD, 3.2 XLT"
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Año *</label>
                <input
                  type="number"
                  min={2000}
                  max={2030}
                  value={formData.year || new Date().getFullYear()}
                  onChange={(e) => handleChange("year", parseInt(e.target.value, 10))}
                  required
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Precio ($ CLP) *</label>
                <input
                  type="number"
                  step={50000}
                  value={formData.price || 0}
                  onChange={(e) => handleChange("price", parseInt(e.target.value, 10))}
                  required
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none font-semibold text-brand-300"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Kilometraje (km)</label>
                <input
                  type="number"
                  step={500}
                  value={formData.km || 0}
                  onChange={(e) => handleChange("km", parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Carrocería</label>
                <select
                  value={formData.bodyType || "SUV"}
                  onChange={(e) => handleChange("bodyType", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                >
                  {BODY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Combustible</label>
                <select
                  value={formData.fuel || "Bencina"}
                  onChange={(e) => handleChange("fuel", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                >
                  {FUELS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Transmisión</label>
                <select
                  value={formData.transmission || "Automática"}
                  onChange={(e) => handleChange("transmission", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                >
                  {TRANSMISSIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">Ubicación / Sucursal</label>
                <input
                  type="text"
                  value={formData.location || "Santiago, RM"}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: MOTOR & SPECS */}
          {activeTab === "engine" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Motor</label>
                  <input
                    type="text"
                    value={formData.engine || ""}
                    onChange={(e) => handleChange("engine", e.target.value)}
                    placeholder="Ej: 2.0L, 2.5L Hybrid"
                    className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Potencia (HP)</label>
                  <input
                    type="text"
                    value={formData.power || ""}
                    onChange={(e) => handleChange("power", e.target.value)}
                    placeholder="Ej: 185 HP"
                    className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Tracción</label>
                  <input
                    type="text"
                    value={formData.traction || "4x2"}
                    onChange={(e) => handleChange("traction", e.target.value)}
                    placeholder="Ej: 4x2, 4x4, AWD"
                    className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">N° de Puertas</label>
                  <input
                    type="number"
                    value={formData.doors || 5}
                    onChange={(e) => handleChange("doors", parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">N° de Dueños</label>
                  <input
                    type="number"
                    value={formData.owners || 1}
                    onChange={(e) => handleChange("owners", parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Highlights List */}
              <div className="rounded-2xl border border-white/10 bg-ink-950 p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-400">
                  Puntos Destacados & Equipamiento
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    placeholder="Agregar punto (ej: Techo panorámico, Cuero, Apple CarPlay)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/15 bg-ink-900 px-3.5 py-2 text-xs text-white outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-400"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(formData.highlights || []).map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90"
                    >
                      <span>✓ {h}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(i)}
                        className="text-white/40 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FOTOS & MULTIMEDIA */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-white/60">
                  Ruta o URL de Imagen de Portada *
                </label>
                <input
                  type="text"
                  value={formData.image || ""}
                  onChange={(e) => handleChange("image", e.target.value)}
                  placeholder="Ej: /cars/toyota-rav4-2022.jpg o URL externa"
                  required
                  className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                />
              </div>

              {formData.image && (
                <div className="rounded-2xl border border-white/10 bg-ink-950 p-4">
                  <span className="text-xs text-white/50 mb-2 block">Vista previa de portada:</span>
                  <div className="aspect-video max-w-sm overflow-hidden rounded-xl border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset(formData.image)}
                      alt="Portada auto"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 text-xs text-white/70 space-y-1">
                <p className="font-semibold text-brand-300">💡 Subida masiva de fotos y fotogramas 360°</p>
                <p>
                  Una vez guardado el vehículo, podrás usar el <b>Gestor de Fotos</b> y el <b>Generador 360° con Video</b> desde el panel de administración para subir álbumes completos arrastrando los archivos.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ESTADO & 360 */}
          {activeTab === "status" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-white/60">Estado de Publicación</label>
                  <select
                    value={formData.status || "Disponible"}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-ink-950 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 outline-none"
                  >
                    <option value="Disponible">🟢 Disponible para venta</option>
                    <option value="En reserva">🟡 En proceso de reserva</option>
                    <option value="Vendido">🔴 Vendido / Entregado</option>
                    <option value="Borrador">⚪ Borrador (Oculto)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/15 bg-ink-950 p-4">
                  <div>
                    <span className="font-medium text-sm text-white">⭐ Destacado en Inicio</span>
                    <p className="text-xs text-white/40">Mostrar en el carrusel de la página principal</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!formData.featured}
                    onChange={(e) => handleChange("featured", e.target.checked)}
                    className="h-5 w-5 accent-brand-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* 360 Spin Configuration */}
              <div className="rounded-2xl border border-white/10 bg-ink-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-white">Giro 360° Interactivo</h3>
                    <p className="text-xs text-white/50">Habilitar visor de secuencia fotográfica 360°</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasSpin}
                    onChange={(e) => setHasSpin(e.target.checked)}
                    className="h-5 w-5 accent-brand-500 rounded cursor-pointer"
                  />
                </div>

                {hasSpin && (
                  <div className="pt-2 border-t border-white/10">
                    <label className="mb-1 block text-xs font-medium text-white/60">
                      Cantidad de fotogramas del giro 360° (ej: 24, 32, 36)
                    </label>
                    <input
                      type="number"
                      min={12}
                      max={72}
                      value={spinCount}
                      onChange={(e) => setSpinCount(parseInt(e.target.value, 10))}
                      className="w-40 rounded-xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:border-brand-500 outline-none"
                    />
                    <p className="mt-1 text-[11px] text-white/40">
                      Las fotos se buscarán en: <code className="text-brand-300">/cars/spin/{formData.slug || "slug"}/001.jpg</code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-xs font-medium text-white/60 hover:text-white transition"
            >
              Cancelar
            </button>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="apple-btn-primary rounded-xl px-7 py-2.5 text-xs font-bold text-white shadow-glow disabled:opacity-50"
              >
                {isSaving ? "Guardando vehículo…" : isEditing ? "Guardar Cambios" : "+ Publicar Vehículo"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
