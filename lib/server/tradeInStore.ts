import { readJson, writeJson } from "./db";

export type TradeInRequest = {
  id: string;
  clientName: string;
  phone: string;
  email?: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  targetVehicleSlug?: string;
  estimatedAppraisal?: number;
  status: "Pendiente" | "Contactado" | "Tasado" | "Cerrado" | "Descartado";
  notes?: string;
  date: string;
  score?: number;
};

const FILENAME = "trade-ins.json";

const SEED_TRADE_INS: TradeInRequest[] = [
  {
    id: "TI-1001",
    clientName: "Patricio Araya",
    phone: "+56 9 8765 4321",
    email: "patricio.araya@gmail.com",
    brand: "Hyundai",
    model: "Tucson 2.0",
    year: 2017,
    km: 84000,
    targetVehicleSlug: "toyota-rav4-hibrido",
    estimatedAppraisal: 11500000,
    status: "Pendiente",
    notes: "Auto único dueño, mantenciones al día en concesionario. Quiere renovar a híbrido.",
    date: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    score: 92,
  },
  {
    id: "TI-1002",
    clientName: "Carolina Valdés",
    phone: "+56 9 7890 1234",
    email: "carolina.valdes@empresa.cl",
    brand: "Chevrolet",
    model: "Tracker LTZ",
    year: 2019,
    km: 52000,
    targetVehicleSlug: "mazda-cx5-2021",
    estimatedAppraisal: 10800000,
    status: "Contactado",
    notes: "Buen estado, requiere tasación presencial para cerrar compra del CX-5.",
    date: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    score: 88,
  },
];

export async function getTradeInRequests(): Promise<TradeInRequest[]> {
  const list = await readJson<TradeInRequest[]>(FILENAME, SEED_TRADE_INS);
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return list;
}

export async function addTradeInRequest(
  data: Omit<TradeInRequest, "id" | "date" | "status"> & { id?: string; date?: string; status?: TradeInRequest["status"] }
): Promise<TradeInRequest> {
  const list = await getTradeInRequests();
  const id = data.id || `TI-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = data.date || new Date().toISOString();
  const status = data.status || "Pendiente";
  const score = data.score ?? 88;

  const item: TradeInRequest = {
    ...data,
    id,
    date,
    status,
    score,
  };

  list.unshift(item);
  await writeJson(FILENAME, list);
  return item;
}

export async function updateTradeInStatus(
  id: string,
  status: TradeInRequest["status"],
  notes?: string,
  estimatedAppraisal?: number
): Promise<TradeInRequest | null> {
  const list = await getTradeInRequests();
  const target = list.find((t) => t.id === id);
  if (!target) return null;
  target.status = status;
  if (notes !== undefined) target.notes = notes;
  if (estimatedAppraisal !== undefined) target.estimatedAppraisal = estimatedAppraisal;
  await writeJson(FILENAME, list);
  return target;
}
