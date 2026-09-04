import { readJson, writeJson } from "./db";

export type CarRequest = {
  id: string;
  clientName: string;
  phone: string;
  email?: string;
  brand: string;
  model: string;
  maxBudget: number;
  minYear?: number;
  fuel?: string;
  transmission?: string;
  notes?: string;
  status: "Pendiente" | "En búsqueda" | "Encontrado" | "Contactado" | "Descartado";
  date: string;
  score?: number;
};

const FILENAME = "car_requests.json";

const SEED_REQUESTS: CarRequest[] = [];

export async function getCarRequests(): Promise<CarRequest[]> {
  const list = await readJson<CarRequest[]>(FILENAME, []);
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return list;
}

export async function addCarRequest(
  data: Omit<CarRequest, "id" | "date" | "status"> & { id?: string; date?: string; status?: CarRequest["status"] }
): Promise<CarRequest> {
  const list = await getCarRequests();
  const id = data.id || `REQ-${Math.floor(100 + Math.random() * 900)}`;
  const date = data.date || new Date().toISOString();
  const status = data.status || "Pendiente";
  const score = data.score ?? (data.maxBudget > 10000000 ? 85 : 70);

  const request: CarRequest = {
    ...data,
    id,
    date,
    status,
    score,
  };

  list.unshift(request);
  await writeJson(FILENAME, list);
  return request;
}

export async function updateCarRequestStatus(
  id: string,
  status: CarRequest["status"],
  notes?: string
): Promise<CarRequest | null> {
  const list = await getCarRequests();
  const target = list.find((r) => r.id === id);
  if (!target) return null;
  target.status = status;
  if (notes !== undefined) target.notes = notes;
  await writeJson(FILENAME, list);
  return target;
}
