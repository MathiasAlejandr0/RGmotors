import { readJson, writeJson } from "./db";
import { COMPANY } from "@/lib/company";

export type SystemSettings = {
  company: {
    name: string;
    tagline: string;
    phoneDisplay: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
    website: string;
  };
  preferences: {
    showSpin360: boolean;
    enableChatbot: boolean;
    showCuotaSimulator: boolean;
    enableOnlineReservation: boolean;
    aiStudioMode: boolean;
    reserveAmount: number;
    defaultDownPct: number;
    defaultTermMonths: number;
    monthlyInterestRate: number;
  };
};

const DEFAULT_SETTINGS: SystemSettings = {
  company: { ...COMPANY },
  preferences: {
    showSpin360: true,
    enableChatbot: true,
    showCuotaSimulator: true,
    enableOnlineReservation: true,
    aiStudioMode: true,
    reserveAmount: 200000,
    defaultDownPct: 20,
    defaultTermMonths: 48,
    monthlyInterestRate: 0.019,
  },
};

const FILENAME = "settings.json";

export async function getSettings(): Promise<SystemSettings> {
  return await readJson<SystemSettings>(FILENAME, DEFAULT_SETTINGS);
}

export async function updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await getSettings();
  const updated: SystemSettings = {
    company: { ...current.company, ...(newSettings.company || {}) },
    preferences: { ...current.preferences, ...(newSettings.preferences || {}) },
  };
  await writeJson(FILENAME, updated);
  return updated;
}
