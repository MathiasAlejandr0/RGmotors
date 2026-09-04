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

const SEED_TRADE_INS: TradeInRequest[] = [];

export async function getTradeInRequests(): Promise<TradeInRequest[]> {
  const list = await readJson<TradeInRequest[]>(FILENAME, []);
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
