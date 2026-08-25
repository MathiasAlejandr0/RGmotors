import { describe, it, expect } from "vitest";
import { formatRut, validateRut, evaluateCreditCapacity } from "./rut";

describe("rut validation and formatting", () => {
  it("formats chilean RUT properly", () => {
    expect(formatRut("123456785")).toBe("12.345.678-5");
    expect(formatRut("111111111")).toBe("11.111.111-1");
  });

  it("validates valid and invalid RUTs", () => {
    expect(validateRut("11.111.111-1")).toBe(true);
    expect(validateRut("12.345.678-5")).toBe(true);
    expect(validateRut("12.345.678-0")).toBe(false);
  });

  it("evaluates credit purchasing power based on income", () => {
    const evalResult = evaluateCreditCapacity(1500000, 3000000, 48);
    expect(evalResult.maxMonthlyQuota).toBe(525000); // 35% of 1.5M
    expect(evalResult.maxFinanced).toBeGreaterThan(10000000);
    expect(evalResult.totalPurchasingPower).toBe(evalResult.maxFinanced + 3000000);
  });
});
