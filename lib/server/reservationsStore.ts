import { readJson, writeJson } from "./db";

export type Reservation = {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  vehicleSlug: string;
  amount: number;
  method: string;
  status: "Pendiente" | "Pagada" | "En proceso" | "Entregado" | "Cancelada";
  date: string;
  trafficSource?: any;
  notes?: string;
};

const FILENAME = "reservations.json";

export async function getReservations(): Promise<Reservation[]> {
  const list = await readJson<Reservation[]>(FILENAME, []);
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return list;
}

export async function addReservation(data: Omit<Reservation, "id" | "date"> & { id?: string; date?: string }): Promise<Reservation> {
  const list = await getReservations();
  const id = data.id || `R-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = data.date || new Date().toISOString();
  const reservation: Reservation = {
    ...data,
    id,
    date,
  };
  list.unshift(reservation);
  await writeJson(FILENAME, list);
  return reservation;
}

export async function updateReservationStatus(id: string, status: Reservation["status"], notes?: string): Promise<Reservation | null> {
  const list = await getReservations();
  const target = list.find((r) => r.id === id);
  if (!target) return null;
  target.status = status;
  if (notes !== undefined) target.notes = notes;
  await writeJson(FILENAME, list);
  return target;
}
