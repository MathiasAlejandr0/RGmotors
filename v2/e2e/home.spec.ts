import { test, expect } from "@playwright/test";

test.describe("Sitio público", () => {
  test("carga la home y muestra marca RG Motors", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/RG|Motors|Puerto|vehículo|auto/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("navega al catálogo", async ({ page }) => {
    await page.goto("/catalogo");
    await expect(page.getByRole("main")).toContainText(
      /catálogo|vehículo|filtr|precio|toyota|mazda|buscar/i
    );
  });
});
