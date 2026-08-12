import { describe, expect, it } from "vitest";
import { asset } from "@/lib/asset";

describe("asset()", () => {
  it("normaliza rutas relativas con slash inicial", () => {
    expect(asset("cars/demo.jpg")).toBe("/cars/demo.jpg");
    expect(asset("/cars/demo.jpg")).toBe("/cars/demo.jpg");
  });

  it("no modifica URLs absolutas", () => {
    expect(asset("https://cdn.example.com/a.jpg")).toBe(
      "https://cdn.example.com/a.jpg"
    );
  });
});
