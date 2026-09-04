import { readJson, writeJson } from "./db";

/**
 * Eventos de simulación para ciencia de datos / CRM.
 * Incluye interacciones anónimas y leads identificados.
 */
export type SimulationEvent = {
  id: string;
  sessionId: string;
  createdAt: string;
  source: "simulador" | "ficha" | "modal" | "catalogo" | "otro";
  vehicleSlug?: string;
  vehiclePrice?: number;
  vehicleYear?: number;
  productId: string;
  downPct: number;
  downPayment: number;
  termMonths: number;
  monthlyPayment: number;
  financed: number;
  monthlyRate: number;
  caeApprox: number;
  /** Datos opcionales del cliente (cuando deja contacto). */
  clientName?: string;
  phone?: string;
  email?: string;
  rut?: string;
  income?: number;
  employmentType?: string;
  trafficSource?: unknown;
  eventType: "view_calc" | "lead_submit";
};

const FILENAME = "simulations.json";
const MAX = 5000;

export async function getSimulationEvents(): Promise<SimulationEvent[]> {
  const list = await readJson<SimulationEvent[]>(FILENAME, []);
  list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return list;
}

export async function addSimulationEvent(
  data: Omit<SimulationEvent, "id" | "createdAt"> & { id?: string; createdAt?: string },
): Promise<SimulationEvent> {
  const list = await getSimulationEvents();
  const event: SimulationEvent = {
    ...data,
    id: data.id || `SIM_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: data.createdAt || new Date().toISOString(),
  };
  list.unshift(event);
  await writeJson(FILENAME, list.slice(0, MAX));
  return event;
}
