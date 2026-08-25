import { readJson, writeJson } from "./db";

export type CreditApplication = {
  id: string;
  clientName: string;
  rut?: string;
  email: string;
  phone: string;
  vehicleSlug?: string;
  downPct: number;
  downPayment?: number;
  term: number;
  monthlyEstimate: number;
  income?: number;
  employmentType?: string;
  maxApprovedAmount?: number;
  score?: number; // Lead Score (0 - 100)
  status: "En evaluación" | "Pre-aprobado" | "Aprobado" | "Rechazado";
  date: string;
  notes?: string;
};

const FILENAME = "credits.json";

export async function getCreditApplications(): Promise<CreditApplication[]> {
  const list = await readJson<CreditApplication[]>(FILENAME, []);
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return list;
}

export async function addCreditApplication(
  data: Omit<CreditApplication, "id" | "date"> & { id?: string; date?: string }
): Promise<CreditApplication> {
  const list = await getCreditApplications();
  const id = data.id || `CRED-${Math.floor(100 + Math.random() * 900)}`;
  const date = data.date || new Date().toISOString();
  
  // Calculate lead score if not specified (e.g. RUT + Income provided gives high score)
  const score = data.score ?? (data.rut && data.income ? 95 : 75);

  const credit: CreditApplication = {
    ...data,
    id,
    date,
    score,
  };
  list.unshift(credit);
  await writeJson(FILENAME, list);
  return credit;
}

export async function updateCreditStatus(
  id: string,
  status: CreditApplication["status"],
  notes?: string
): Promise<CreditApplication | null> {
  const list = await getCreditApplications();
  const target = list.find((c) => c.id === id);
  if (!target) return null;
  target.status = status;
  if (notes !== undefined) target.notes = notes;
  await writeJson(FILENAME, list);
  return target;
}
