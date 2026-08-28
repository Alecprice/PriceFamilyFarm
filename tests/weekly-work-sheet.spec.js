import { test, expect } from "@playwright/test";

test("weekly work sheet combines tasks, successions, low stock, and market prep for printing", async ({ page }) => {
  await page.addInitScript(() => {
    function localDay(offset = 0) {
      const value = new Date();
      value.setHours(12, 0, 0, 0);
      value.setDate(value.getDate() + offset);
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    window.__printed = false;
    window.print = () => { window.__printed = true; };
    localStorage.setItem("price-family-farm-calendar-v1", JSON.stringify([{ id: "t1", date: localDay(), task: "Water seedlings", category: "Maintenance", status: "Planned" }]));
    localStorage.setItem("price-family-farm-plantings-v1", JSON.stringify([{ id: "p1", crop: "Lettuce", variety: "Butterhead", bed: "Bed C", status: "Seeded", nextSuccessionDate: localDay(3), harvestStart: localDay(6) }]));
    localStorage.setItem("price-family-farm-inventory-v1", JSON.stringify([{ id: "i1", name: "Seed-starting mix", quantity: "1", reorderAt: "2", unit: "bag", supplier: "Local supplier" }]));
    localStorage.setItem("price-family-farm-market-plan-v1", JSON.stringify([{ id: "m1", date: localDay(2), product: "Lettuce", marketQty: "12", packedQty: "4", unit: "count", interestCount: "5", status: "Planning" }]));
  });

  await page.goto("/weekly-work-sheet/");
  await expect(page.getByRole("heading", { name: "Water seedlings", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lettuce · Butterhead", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seed-starting mix", exact: true })).toBeVisible();
  await expect(page.getByText("12 count planned · 4 count packed · 5 aggregate interest signals.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Print weekly work sheet", exact: true }).click();
  expect(await page.evaluate(() => window.__printed)).toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
