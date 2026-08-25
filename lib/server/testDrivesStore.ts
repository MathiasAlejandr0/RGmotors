import { readJson, writeJson } from "./db";

export type TestDriveStatus =
  | "Pendiente"
  | "Confirmada"
  | "Realizada"
  | "No asistió"
  | "Cancelada";

export type TrafficInfo = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  referrer?: string;
};

export type TestDrive = {
  id: string;
  vehicleSlug: string;
  vehicleTitle: string;
  branch: string;
  date: string; // e.g. "28 de agosto, 2026"
  time: string; // e.g. "11:30"
  executive?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  status: TestDriveStatus;
  trafficSource?: TrafficInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const FILENAME = "test-drives.json";

export async function getTestDrives(): Promise<TestDrive[]> {
  const list = await readJson<TestDrive[]>(FILENAME, []);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export async function addTestDrive(
  data: Omit<TestDrive, "id" | "createdAt" | "updatedAt" | "status"> & {
    id?: string;
    status?: TestDriveStatus;
  }
): Promise<TestDrive> {
  const list = await getTestDrives();
  const now = new Date().toISOString();
  const id = data.id || `TD-${Math.floor(1000 + Math.random() * 9000)}`;

  const item: TestDrive = {
    ...data,
    id,
    status: data.status || "Pendiente",
    createdAt: now,
    updatedAt: now,
  };

  list.unshift(item);
  await writeJson(FILENAME, list);
  return item;
}

export async function updateTestDrive(
  id: string,
  patch: Partial<Pick<TestDrive, "status" | "notes" | "branch" | "date" | "time" | "executive">>
): Promise<TestDrive | null> {
  const list = await getTestDrives();
  const target = list.find((t) => t.id === id);
  if (!target) return null;

  if (patch.status) target.status = patch.status;
  if (patch.notes !== undefined) target.notes = patch.notes;
  if (patch.branch) target.branch = patch.branch;
  if (patch.date) target.date = patch.date;
  if (patch.time) target.time = patch.time;
  if (patch.executive !== undefined) target.executive = patch.executive;
  target.updatedAt = new Date().toISOString();

  await writeJson(FILENAME, list);
  return target;
}

export async function deleteTestDrive(id: string): Promise<boolean> {
  const list = await getTestDrives();
  const filtered = list.filter((t) => t.id !== id);
  if (filtered.length === list.length) return false;
  await writeJson(FILENAME, filtered);
  return true;
}
