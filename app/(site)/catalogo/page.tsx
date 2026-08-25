"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  vehicles as initialVehicles,
  BRANDS,
  BODY_TYPES,
  FUELS,
  TRANSMISSIONS,
  formatCLP,
  Vehicle,
} from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";
import CatalogPdfButton from "@/components/CatalogPdfButton";
import QuickCategoryFilter, { CategoryPill } from "@/components/QuickCategoryFilter";

const MAX_PRICE = 30000000;

type Sort = "relevancia" | "precio-asc" | "precio-desc" | "km-asc" | "year-desc";

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-white/40">Cargando catálogo…</div>}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [vehicleList, setVehicleList] = useState<Vehicle[]>(initialVehicles);
  const [activeCat, setActiveCat] = useState<CategoryPill>("todos");
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [trans, setTrans] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minYear, setMinYear] = useState(2018);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("relevancia");
  const [showFilters, setShowFilters] = useState(false);

  // Load from API on mount
  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.vehicles) {
          setVehicleList(data.vehicles);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize filters from URL search params
  useEffect(() => {
    const brandParam = searchParams.get("marca");
    if (brandParam) setBrands(brandParam.split(","));

    const typeParam = searchParams.get("carroceria");
    if (typeParam) setTypes(typeParam.split(","));

    const fuelParam = searchParams.get("combustible");
    if (fuelParam) setFuels(fuelParam.split(","));

    const qParam = searchParams.get("q");
    if (qParam) setQuery(qParam);

    const sortParam = searchParams.get("sort") as Sort;
    if (sortParam) setSort(sortParam);
  }, [searchParams]);

  // Sync state changes to URL
  const updateUrlParams = (newBrands: string[], newTypes: string[], newFuels: string[], newQ: string) => {
    const params = new URLSearchParams();
    if (newBrands.length) params.set("marca", newBrands.join(","));
    if (newTypes.length) params.set("carroceria", newTypes.join(","));
    if (newFuels.length) params.set("combustible", newFuels.join(","));
    if (newQ) params.set("q", newQ);
    const queryString = params.toString();
    router.replace(queryString ? `/catalogo?${queryString}` : "/catalogo", { scroll: false });
  };

  const categoryCounts = useMemo(() => ({
    todos: vehicleList.length,
    hibridos: vehicleList.filter((v) => v.fuel === "Híbrido" || v.fuel === "Eléctrico").length,
    suv: vehicleList.filter((v) => v.bodyType === "SUV").length,
    sedan: vehicleList.filter((v) => v.bodyType === "Sedán").length,
    camioneta: vehicleList.filter((v) => v.bodyType === "Camioneta").length,
    "bajo-km": vehicleList.filter((v) => v.km <= 30000).length,
  }), [vehicleList]);

  const handleSelectQuickCategory = (cat: CategoryPill) => {
    setActiveCat(cat);
    switch (cat) {
      case "hibridos":
        setFuels(["Híbrido"]);
        setTypes([]);
        updateUrlParams(brands, [], ["Híbrido"], query);
        break;
      case "suv":
        setTypes(["SUV"]);
        setFuels([]);
        updateUrlParams(brands, ["SUV"], [], query);
        break;
      case "sedan":
        setTypes(["Sedán"]);
        setFuels([]);
        updateUrlParams(brands, ["Sedán"], [], query);
        break;
      case "camioneta":
        setTypes(["Camioneta"]);
        setFuels([]);
        updateUrlParams(brands, ["Camioneta"], [], query);
        break;
      default:
        setTypes([]);
        setFuels([]);
        updateUrlParams(brands, [], [], query);
        break;
    }
  };

  const toggleBrand = (b: string) => {
    const updated = brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b];
    setBrands(updated);
    updateUrlParams(updated, types, fuels, query);
  };

  const toggleType = (t: string) => {
    const updated = types.includes(t) ? types.filter((x) => x !== t) : [...types, t];
    setTypes(updated);
    updateUrlParams(brands, updated, fuels, query);
  };

  const toggleFuel = (f: string) => {
    const updated = fuels.includes(f) ? fuels.filter((x) => x !== f) : [...fuels, f];
    setFuels(updated);
    updateUrlParams(brands, types, updated, query);
  };

  const toggleTrans = (t: string) => {
    setTrans(trans.includes(t) ? trans.filter((x) => x !== t) : [...trans, t]);
  };

  const filtered = useMemo(() => {
    let result = vehicleList.filter((v) => {
      if (activeCat === "bajo-km" && v.km > 30000) return false;
      if (brands.length && !brands.includes(v.brand)) return false;
      if (types.length && !types.includes(v.bodyType)) return false;
      if (fuels.length && !fuels.includes(v.fuel)) return false;
      if (trans.length && !trans.includes(v.transmission)) return false;
      if (v.price > maxPrice) return false;
      if (v.year < minYear) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!`${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(q))
          return false;
      }
      return true;
    });

    switch (sort) {
      case "precio-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "km-asc":
        result = [...result].sort((a, b) => a.km - b.km);
        break;
      case "year-desc":
        result = [...result].sort((a, b) => b.year - a.year);
        break;
      default:
        result = [...result].sort(
          (a, b) => Number(b.featured) - Number(a.featured)
        );
    }
    return result;
  }, [vehicleList, activeCat, brands, types, fuels, trans, maxPrice, minYear, query, sort]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (brands.length) parts.push(brands.join(", "));
    if (types.length) parts.push(types.join(", "));
    if (fuels.length) parts.push(fuels.join(", "));
    if (trans.length) parts.push(trans.join(", "));
    if (maxPrice < MAX_PRICE) parts.push(`hasta ${formatCLP(maxPrice)}`);
    if (minYear > 2018) parts.push(`${minYear}+`);
    if (query) parts.push(`"${query}"`);
    return parts.length ? parts.join(" · ") : "Catálogo completo";
  }, [brands, types, fuels, trans, maxPrice, minYear, query]);

  const clearAll = () => {
    setBrands([]);
    setTypes([]);
    setFuels([]);
    setTrans([]);
    setMaxPrice(MAX_PRICE);
    setMinYear(2018);
    setQuery("");
    setActiveCat("todos");
    router.replace("/catalogo", { scroll: false });
  };

  const Filters = (
    <div className="space-y-6">
      <FilterGroup title="Marca">
        {BRANDS.map((b) => (
          <Check key={b} label={b} checked={brands.includes(b)} onChange={() => toggleBrand(b)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Tipo de vehículo">
        {BODY_TYPES.map((t) => (
          <Check key={t} label={t} checked={types.includes(t)} onChange={() => toggleType(t)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Precio máximo">
        <input
          type="range"
          min={5000000}
          max={MAX_PRICE}
          step={500000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="apple-range w-full cursor-pointer"
        />
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-brand-300">
          <span>Hasta {formatCLP(maxPrice)}</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Año desde">
        <input
          type="range"
          min={2015}
          max={2024}
          step={1}
          value={minYear}
          onChange={(e) => setMinYear(Number(e.target.value))}
          className="apple-range w-full cursor-pointer"
        />
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-brand-300">
          <span>{minYear} en adelante</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Combustible">
        {FUELS.map((f) => (
          <Check key={f} label={f} checked={fuels.includes(f)} onChange={() => toggleFuel(f)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Transmisión">
        {TRANSMISSIONS.map((t) => (
          <Check key={t} label={t} checked={trans.includes(t)} onChange={() => toggleTrans(t)} />
        ))}
      </FilterGroup>

      <button
        onClick={clearAll}
        className="apple-btn-secondary w-full rounded-2xl py-2.5 text-xs font-semibold tracking-wide"
      >
        Limpiar filtros
      </button>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Catálogo de Vehículos
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Explora y filtra nuestra selección de autos con garantía e inspección técnica.
          </p>
        </div>
        <CatalogPdfButton vehicles={filtered} filterSummary={filterSummary} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block">
          <div className="apple-glass-card sticky top-24 rounded-3xl p-6">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
                Filtros
              </h2>
              <span className="text-[11px] text-brand-300 font-medium">{filtered.length} resultados</span>
            </div>
            {Filters}
          </div>
        </aside>

        {/* Results */}
        <div className="space-y-6">
          <QuickCategoryFilter
            activeCategory={activeCat}
            onSelectCategory={handleSelectQuickCategory}
            counts={categoryCounts}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-white/40 pointer-events-none">
                🔍
              </span>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  updateUrlParams(brands, types, fuels, e.target.value);
                }}
                placeholder="Buscar marca o modelo…"
                className="w-full rounded-full border border-white/15 bg-white/[0.05] pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 outline-none focus:border-brand-500 focus:bg-white/[0.08] focus:ring-2 focus:ring-brand-500/20 transition"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="apple-btn-secondary rounded-full px-4 py-2 text-xs font-medium lg:hidden"
              >
                Filtros {showFilters ? "▲" : "▼"}
              </button>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white outline-none focus:border-brand-500 transition cursor-pointer backdrop-blur-md"
              >
                <option value="relevancia" className="bg-ink-900">Ordenar por: Relevancia</option>
                <option value="precio-asc" className="bg-ink-900">Precio: menor a mayor</option>
                <option value="precio-desc" className="bg-ink-900">Precio: mayor a menor</option>
                <option value="km-asc" className="bg-ink-900">Menor kilometraje</option>
                <option value="year-desc" className="bg-ink-900">Más nuevos</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 apple-glass-card rounded-3xl p-6 lg:hidden">
              {Filters}
            </div>
          )}

          <p className="mb-4 text-xs font-medium text-white/45">
            Mostrando {filtered.length} {filtered.length === 1 ? "vehículo" : "vehículos"}
          </p>

          {filtered.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((v) => (
                <VehicleCard key={v.slug} vehicle={v} />
              ))}
            </div>
          ) : (
            <div className="apple-glass-card rounded-3xl p-14 text-center text-white/50">
              <p className="text-base font-semibold text-white">No encontramos vehículos</p>
              <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto">
                No hay coincidencias con los filtros aplicados. Prueba ampliando el rango de precio o año.
              </p>
              <button
                onClick={clearAll}
                className="apple-btn-primary mt-5 rounded-full px-6 py-2.5 text-xs font-semibold text-white"
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-white/65 hover:text-white transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-white/20 bg-white/10 accent-brand-500 cursor-pointer"
      />
      {label}
    </label>
  );
}
