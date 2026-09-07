import { describe, expect, it } from "vitest";
import {
  evaluateSheetWipeGuard,
  guessBodyTypeFromModel,
} from "@/lib/server/sheetSyncGuards";

describe("evaluateSheetWipeGuard", () => {
  it("aborta sync si la hoja no trae activos", () => {
    const r = evaluateSheetWipeGuard({
      sheetActiveCount: 0,
      currentActiveCount: 30,
      wouldArchiveCount: 30,
    });
    expect(r.abortAll).toBe(true);
    expect(r.skipArchive).toBe(true);
  });

  it("omite archivo masivo ante caída >35%", () => {
    const r = evaluateSheetWipeGuard({
      sheetActiveCount: 10,
      currentActiveCount: 30,
      wouldArchiveCount: 20,
    });
    expect(r.abortAll).toBe(false);
    expect(r.skipArchive).toBe(true);
  });

  it("permite archivo normal con caída chica", () => {
    const r = evaluateSheetWipeGuard({
      sheetActiveCount: 28,
      currentActiveCount: 30,
      wouldArchiveCount: 2,
    });
    expect(r.abortAll).toBe(false);
    expect(r.skipArchive).toBe(false);
  });
});

describe("guessBodyTypeFromModel", () => {
  it("infiere camioneta sin inventar combustible", () => {
    expect(guessBodyTypeFromModel("HILUX 4X4")).toBe("Camioneta");
    expect(guessBodyTypeFromModel("MODELO RARO XYZ")).toBe("Por confirmar");
  });
});
