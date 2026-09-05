import { describe, expect, it } from "vitest";
import { COMPANY, autofinSimulatorUrl, whatsappLink } from "@/lib/company";

describe("company config", () => {
  it("tiene datos de contacto de Puerto Montt", () => {
    expect(COMPANY.name).toMatch(/RG Motors/i);
    expect(COMPANY.whatsapp).toMatch(/^56\d+$/);
    expect(COMPANY.email).toContain("@");
    expect(COMPANY.address.toLowerCase()).toContain("puerto montt");
  });

  it("arma URL Autofin con ces_id", () => {
    const url = autofinSimulatorUrl({ monto: "10000000" });
    expect(url).toContain("autofin.cl");
    expect(url).toContain("ces_id=");
    expect(url).toContain("monto=10000000");
  });

  it("arma link de WhatsApp", () => {
    const url = whatsappLink("Hola RG");
    expect(url).toContain("wa.me/");
    expect(url).toContain(COMPANY.whatsapp);
  });
});
