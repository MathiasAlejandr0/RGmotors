import { describe, it, expect, beforeEach } from "vitest";
import {
  getTestDrives,
  addTestDrive,
  updateTestDrive,
  deleteTestDrive,
} from "./testDrivesStore";

describe("testDrivesStore", () => {
  it("agrega, actualiza y elimina una prueba de manejo correctamente", async () => {
    const created = await addTestDrive({
      vehicleSlug: "toyota-rav4-2022",
      vehicleTitle: "Toyota RAV4 2022",
      branch: "Las Condes",
      date: "28 de agosto, 2026",
      time: "11:30 hrs",
      executive: "Camila Rojas",
      clientName: "Prueba Test",
      clientPhone: "+56911223344",
      clientEmail: "test@rgmotors.cl",
      notes: "Nota de prueba",
      trafficSource: {
        source: "Facebook",
        campaign: "lanzamiento",
      },
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe("Pendiente");
    expect(created.clientName).toBe("Prueba Test");

    const list = await getTestDrives();
    const found = list.find((t) => t.id === created.id);
    expect(found).toBeDefined();

    // Update status
    const updated = await updateTestDrive(created.id, {
      status: "Confirmada",
      notes: "Confirmado por WhatsApp",
    });
    expect(updated?.status).toBe("Confirmada");
    expect(updated?.notes).toBe("Confirmado por WhatsApp");

    // Delete
    const deleted = await deleteTestDrive(created.id);
    expect(deleted).toBe(true);
  });
});
