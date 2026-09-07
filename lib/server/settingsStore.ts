import { readJson, writeJson } from "./db";
import { COMPANY } from "@/lib/company";
import { AUTOFIN_DEFAULT_MONTHLY_RATE } from "@/lib/finance/autofin";

export type SystemSettings = {
  company: {
    name: string;
    legalName?: string;
    rut?: string;
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
  company: {
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    rut: COMPANY.rut,
    tagline: COMPANY.tagline,
    phoneDisplay: COMPANY.phoneDisplay,
    whatsapp: COMPANY.whatsapp,
    email: COMPANY.email,
    address: COMPANY.address,
    hours: COMPANY.hours,
    website: COMPANY.website,
  },
  preferences: {
    showSpin360: false,
    enableChatbot: true,
    showCuotaSimulator: true,
    enableOnlineReservation: true,
    aiStudioMode: false,
    reserveAmount: 200000,
    defaultDownPct: 20,
    defaultTermMonths: 48,
    monthlyInterestRate: AUTOFIN_DEFAULT_MONTHLY_RATE,
  },
};

const FILENAME = "settings.json";

function normalizeSettings(raw: SystemSettings): SystemSettings {
  const rate = Number(raw.preferences?.monthlyInterestRate);
  const fixedRate =
    !Number.isFinite(rate) || rate < AUTOFIN_DEFAULT_MONTHLY_RATE - 0.00005
      ? AUTOFIN_DEFAULT_MONTHLY_RATE
      : rate;
  return {
    ...raw,
    preferences: {
      ...DEFAULT_SETTINGS.preferences,
      ...raw.preferences,
      monthlyInterestRate: fixedRate,
    },
    company: { ...DEFAULT_SETTINGS.company, ...raw.company },
  };
}

export async function getSettings(): Promise<SystemSettings> {
  const raw = await readJson<SystemSettings>(FILENAME, DEFAULT_SETTINGS);
  const normalized = normalizeSettings(raw);
  // Persistir migración si settings viejos tenían 1.85%/1.9%/2.5%
  if (
    Number(raw.preferences?.monthlyInterestRate) !==
    normalized.preferences.monthlyInterestRate
  ) {
    await writeJson(FILENAME, normalized).catch(() => false);
  }
  return normalized;
}

export async function updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await getSettings();
  const updated: SystemSettings = normalizeSettings({
    company: { ...current.company, ...(newSettings.company || {}) },
    preferences: { ...current.preferences, ...(newSettings.preferences || {}) },
  });
  await writeJson(FILENAME, updated);
  return updated;
}
