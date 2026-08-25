import { describe, it, expect } from "vitest";
import { getVehicles, getVehicleBySlug } from "./vehiclesStore";

describe("vehiclesStore", () => {
  it("loads the list of vehicles", async () => {
    const list = await getVehicles();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("slug");
    expect(list[0]).toHaveProperty("brand");
    expect(list[0]).toHaveProperty("price");
  });

  it("finds a vehicle by slug", async () => {
    const rav4 = await getVehicleBySlug("toyota-rav4-hibrido");
    expect(rav4).toBeDefined();
    expect(rav4?.brand).toBe("Toyota");
    expect(rav4?.model).toBe("RAV4");
  });
});
