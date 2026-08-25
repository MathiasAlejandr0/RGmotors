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

const SEED_REQUESTS: CarRequest[] = [
  {
    id: "REQ-101",
    clientName: "Rodrigo Morales",
    phone: "+56 9 8412 9901",
    email: "rodrigo.morales@gmail.com",
    brand: "Toyota",
    model: "Hilux 4x4",
    maxBudget: 22000000,
    minYear: 2021,
    fuel: "Diésel",
    transmission: "Automática",
    notes: "Busco versión SRV o GR-S con menos de 60.000 km para faena y familia.",
    status: "En búsqueda",
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    score: 90,
  },
  {
    id: "REQ-102",
    clientName: "Francisca Valenzuela",
    phone: "+56 9 7311 4452",
    email: "francisca.v@outlook.com",
    brand: "Subaru",
    model: "Forester",
    maxBudget: 17500000,
    minYear: 2020,
    fuel: "Gasolina",
    transmission: "Automática",
    notes: "Ideal con techo panorámico y cámara de retroceso.",
    status: "Pendiente",
    date: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    score: 85,
  },
];

export async function getCarRequests(): Promise<CarRequest[]> {
  const list = await readJson<CarRequest[]>(FILENAME, SEED_REQUESTS);
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
