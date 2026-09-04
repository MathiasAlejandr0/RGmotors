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

const SEED_ALERTS: PriceAlert[] = [];

export async function getPriceAlerts(): Promise<PriceAlert[]> {
  const list = await readJson<PriceAlert[]>(FILENAME, []);
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
