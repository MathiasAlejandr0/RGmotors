import { describe, expect, it } from "vitest";
import {
  answerAsExecutive,
  parseLeadContact,
  type ChatVehicle,
} from "@/lib/chat/executiveVirtual";

const stock: ChatVehicle[] = [
  {
    slug: "toyota-hilux-4x2-2023",
    brand: "Toyota",
    model: "HILUX 4X2",
    price: 18_000_000,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
  },
  {
    slug: "mitsubishi-l200-katana",
    brand: "Mitsubishi",
    model: "L200 KATANA 4X4",
    price: 15_500_000,
    bodyType: "Camioneta",
    fuel: "Diésel",
    transmission: "Manual",
  },
  {
    slug: "peugeot-suv-auto",
    brand: "Peugeot",
    model: "2008 AUTO",
    price: 12_000_000,
    bodyType: "SUV",
    fuel: "Bencina",
    transmission: "Automática",
  },
];

describe("executiveVirtual", () => {
  it("combina filtros AND (camioneta + diésel + presupuesto)", () => {
    const r = answerAsExecutive("Camioneta diésel bajo 16m", stock);
    expect(r.cars).toEqual(["mitsubishi-l200-katana"]);
    expect(r.budget).toBe(16_000_000);
  });

  it("encuentra por marca y modelo", () => {
    const r = answerAsExecutive("busco toyota hilux", stock);
    expect(r.cars?.[0]).toBe("toyota-hilux-4x2-2023");
  });

  it("responde FAQ de horario", () => {
    const r = answerAsExecutive("cuál es el horario?", stock);
    expect(r.intents).toContain("horario");
    expect(r.text.toLowerCase()).toMatch(/lun|vie|sáb|sab/);
  });

  it("valida contacto chile", () => {
    const ok = parseLeadContact("Ana", "9 5907 3127");
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.contact).toBe("+56959073127");

    const bad = parseLeadContact("A", "123");
    expect(bad.ok).toBe(false);
  });
});
