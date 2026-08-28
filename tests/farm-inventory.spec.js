import { test, expect } from "@playwright/test";

test("farm inventory persists supplies and surfaces low-stock items without network sync", async ({ page }) => {
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/farm-inventory/");

  await page.getByLabel("Item", { exact: true }).fill("Potting mix");
  await page.getByLabel("Category", { exact: true }).selectOption("Growing media");
  await page.getByLabel("Quantity on hand", { exact: true }).fill("2");
  await page.getByLabel("Unit", { exact: true }).selectOption("bag");
  await page.getByLabel("Reorder at or below", { exact: true }).fill("3");
  await page.getByLabel("Supplier", { exact: true }).fill("Local supplier");
  await page.getByLabel("Last cost", { exact: true }).fill("18.50");
  await page.getByRole("button", { name: "Add inventory item", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Potting mix", exact: true })).toBeVisible();
  await expect(page.getByText("Low stock — add this to the next supply run.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Low stock (1)", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Potting mix", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Increase Potting mix quantity", exact: true }).click();
  await page.getByRole("button", { name: "Increase Potting mix quantity", exact: true }).click();
  await expect(page.getByText("Stock level is above the saved reorder threshold.", { exact: true })).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("price-family-farm-inventory-v1")));
  expect(stored).toHaveLength(1);
  expect(stored[0].quantity).toBe("4");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);

  const contactedExternalFarmServices = requests.some((rawUrl) => {
    try {
      const hostname = new URL(rawUrl).hostname;
      return hostname === "api.weather.gov" || hostname === "api.web3forms.com";
    } catch {
      return false;
    }
  });
  expect(contactedExternalFarmServices).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
