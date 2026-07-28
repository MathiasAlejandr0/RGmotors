"use client";

import { useMemo, useState } from "react";
import {
  vehicles,
  BRANDS,
  BODY_TYPES,
  FUELS,
  TRANSMISSIONS,
  formatCLP,
} from "@/lib/vehicles";
import VehicleCard from "@/components/VehicleCard";

const MAX_PRICE = Math.max(...vehicles.map((v) => v.price));

type Sort = "relevancia" | "precio-asc" | "precio-desc" | "km-asc" | "year-desc";

export default function CatalogPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [trans, setTrans] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minYear, setMinYear] = useState(2019);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("relevancia");
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (
    value: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const filtered = useMemo(() => {
    let result = vehicles.filter((v) => {
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
  }, [brands, types, fuels, trans, maxPrice, minYear, query, sort]);

  const clearAll = () => {
    setBrands([]);
    setTypes([]);
    setFuels([]);
    setTrans([]);
    setMaxPrice(MAX_PRICE);
    setMinYear(2019);
    setQuery("");
  };

  const Filters = (
    <div className="space-y-6">
      <FilterGroup title="Marca">
        {BRANDS.map((b) => (
          <Check key={b} label={b} checked={brands.includes(b)} onChange={() => toggle(b, brands, setBrands)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Tipo de vehículo">
        {BODY_TYPES.map((t) => (
          <Check key={t} label={t} checked={types.includes(t)} onChange={() => toggle(t, types, setTypes)} />
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
          className="w-full accent-brand-500"
        />
        <p className="mt-1 text-sm text-white/70">Hasta {formatCLP(maxPrice)}</p>
      </FilterGroup>

      <FilterGroup title="Año desde">
        <input
          type="range"
          min={2015}
          max={2023}
          step={1}
          value={minYear}
          onChange={(e) => setMinYear(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <p className="mt-1 text-sm text-white/70">{minYear} en adelante</p>
      </FilterGroup>

      <FilterGroup title="Combustible">
        {FUELS.map((f) => (
          <Check key={f} label={f} checked={fuels.includes(f)} onChange={() => toggle(f, fuels, setFuels)} />
        ))}
      </FilterGroup>

      <FilterGroup title="Transmisión">
        {TRANSMISSIONS.map((t) => (
          <Check key={t} label={t} checked={trans.includes(t)} onChange={() => toggle(t, trans, setTrans)} />
        ))}
      </FilterGroup>

      <button
        onClick={clearAll}
        className="w-full rounded-lg border border-white/10 py-2 text-sm text-white/70 transition hover:bg-white/5"
      >
        Limpiar filtros
      </button>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <p className="text-white/50">Encuentra tu próximo auto entre nuestra selección.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-white/10 bg-ink-800/60 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/50">
              Filtros
            </h2>
            {Filters}
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar marca o modelo…"
              className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none focus:border-brand-500 sm:max-w-xs"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="rounded-lg border border-white/10 px-3 py-2 text-sm lg:hidden"
              >
                Filtros
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none focus:border-brand-500"
              >
                <option value="relevancia">Ordenar por: Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="km-asc">Menor kilometraje</option>
                <option value="year-desc">Más nuevos</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-ink-800/60 p-5 lg:hidden">
              {Filters}
            </div>
          )}

          <p className="mb-4 text-sm text-white/50">
            {filtered.length} {filtered.length === 1 ? "vehículo" : "vehículos"}
          </p>

          {filtered.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((v) => (
                <VehicleCard key={v.slug} vehicle={v} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-ink-800/60 p-12 text-center text-white/50">
              No hay vehículos con esos filtros. Prueba ampliando el precio o el año.
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
      <h3 className="mb-2 text-sm font-medium text-white/80">{title}</h3>
      <div className="space-y-1.5">{children}</div>
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
    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60 hover:text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-brand-500"
      />
      {label}
    </label>
  );
}
