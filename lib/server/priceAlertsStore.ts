import { readJson, writeJson } from "./db";

export type PriceAlert = {
  id: string;
  vehicleSlug: string;
  vehicleName: string;
  currentPrice: number;
  targetPrice?: number;
  clientName: string;
  phone: string;
  email?: string;
  date: string;
  status: "Activa" | "Notificada" | "Comprado" | "Cancelada";
  score?: number;
};

const FILENAME = "price_alerts.json";

const SEED_ALERTS: PriceAlert[] = [
  {
    id: "ALT-201",
    vehicleSlug: "toyota-rav4-hibrido",
    vehicleName: "Toyota RAV4 Híbrido 2022",
    currentPrice: 19490000,
    targetPrice: 18500000,
    clientName: "Gonzalo Pinto",
    phone: "+56 9 9123 8841",
    email: "gonzalo.pinto@gmail.com",
    date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    status: "Activa",
    score: 80,
  },
  {
    id: "ALT-202",
    vehicleSlug: "mazda-cx5-2021",
    vehicleName: "Mazda CX-5 2.0 2021",
    currentPrice: 16990000,
    targetPrice: 16000000,
    clientName: "Andrea Muñoz",
    phone: "+56 9 6554 1120",
    email: "andrea.m@hotmail.com",
    date: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    status: "Activa",
    score: 80,
  },
];

export async function getPriceAlerts(): Promise<PriceAlert[]> {
  const list = await readJson<PriceAlert[]>(FILENAME, SEED_ALERTS);
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return list;
}

export async function addPriceAlert(
  data: Omit<PriceAlert, "id" | "date" | "status"> & { id?: string; date?: string; status?: PriceAlert["status"] }
): Promise<PriceAlert> {
  const list = await getPriceAlerts();
  const id = data.id || `ALT-${Math.floor(100 + Math.random() * 900)}`;
  const date = data.date || new Date().toISOString();
  const status = data.status || "Activa";
  const score = data.score ?? 80;

  const alert: PriceAlert = {
    ...data,
    id,
    date,
    status,
    score,
  };

  list.unshift(alert);
  await writeJson(FILENAME, list);
  return alert;
}

export async function updatePriceAlertStatus(
  id: string,
  status: PriceAlert["status"]
): Promise<PriceAlert | null> {
  const list = await getPriceAlerts();
  const target = list.find((a) => a.id === id);
  if (!target) return null;
  target.status = status;
  await writeJson(FILENAME, list);
  return target;
}
