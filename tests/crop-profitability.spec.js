import { test, expect } from "@playwright/test";

test("crop profitability compares recorded margin, mapped area, units, and seasons", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-garden-layout-v1", JSON.stringify([
      { id: "b1", name: "Bed A", length: "20", width: "4", crop: "Tomato", notes: "" },
      { id: "b2", name: "Bed B", length: "10", width: "4", crop: "Pepper", notes: "" },
    ]));
    localStorage.setItem("price-family-farm-plantings-v1", JSON.stringify([
      { id: "p1", crop: "Tomato", variety: "Cherokee Purple", bed: "Bed A", status: "Harvesting" },
      { id: "p2", crop: "Pepper", variety: "Jalapeño", bed: "Bed B", status: "Harvesting" },
    ]));
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [
        { id: "h1", date: "2026-08-01", crop: "Tomato", variety: "Cherokee Purple", location: "Bed A", quantity: "10", unit: "lb", destination: "sold", saleAmount: "100" },
        { id: "h2", date: "2026-08-02", crop: "Pepper", variety: "Jalapeño", location: "Bed B", quantity: "20", unit: "count", destination: "sold", saleAmount: "40" },
        { id: "h3", date: "2025-08-01", crop: "Tomato", variety: "Cherokee Purple", location: "Bed A", quantity: "5", unit: "lb", destination: "sold", saleAmount: "30" },
      ],
      experiments: [],
      expenses: [
        { id: "e1", date: "2026-07-01", crop: "Tomato", description: "Tomato inputs", amount: "20", category: "seed-plant" },
        { id: "e2", date: "2026-07-01", crop: "Pepper", description: "Pepper inputs", amount: "30", category: "seed-plant" },
        { id: "e3", date: "2025-07-01", crop: "Tomato", description: "Old inputs", amount: "10", category: "seed-plant" },
      ],
    }));
  });

  await page.goto("/crop-profitability/");
  await page.getByLabel("Season", { exact: true }).selectOption("2026");

  const summary = page.getByLabel("Crop economics summary");
  await expect(summary.getByText("$140.00", { exact: true })).toBeVisible();
  await expect(summary.getByText("$50.00", { exact: true })).toBeVisible();
  await expect(summary.getByText("$90.00", { exact: true })).toBeVisible();

  const tomato = page.getByRole("heading", { name: "Tomato", exact: true }).locator("..");
  await expect(tomato.getByText("$80.00 recorded margin", { exact: false })).toBeVisible();
  await expect(tomato.getByText("$1.25 sales/ft² · $1.00 recorded margin/ft².", { exact: true })).toBeVisible();
  await expect(tomato.getByText("$2.00 direct crop expense per lb.", { exact: true })).toBeVisible();
  await expect(tomato.getByText("0.13 lb/ft² recorded yield.", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "2026", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2025", exact: true })).toBeVisible();
  const strongest = page.locator(".farm-tools-note").filter({ hasText: "Strongest recorded margin:" });
  await expect(strongest).toContainText("Tomato");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
