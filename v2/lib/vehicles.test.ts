import { describe, expect, it } from "vitest";
import { formatCLP, estimateMonthly, vehicles } from "@/lib/vehicles";

describe("formatCLP()", () => {
  it("formatea montos en pesos chilenos", () => {
    const formatted = formatCLP(15990000);
    expect(formatted).toContain("15");
    expect(formatted).toMatch(/\$|CLP|15/);
  });
});

describe("estimateMonthly()", () => {
  it("devuelve una cuota positiva menor al precio", () => {
    const price = 10_000_000;
    const cuota = estimateMonthly(price);
    expect(cuota).toBeGreaterThan(0);
    expect(cuota).toBeLessThan(price);
  });
});

describe("vehicles catalog", () => {
  it("tiene al menos un vehículo con slug", () => {
    expect(vehicles.length).toBeGreaterThan(0);
    expect(vehicles[0]?.slug).toBeTruthy();
  });
});
