import { test, expect } from "@playwright/test";

test("market planner keeps availability manual while linking recent harvest signals", async ({ page }) => {
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
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [{ id: "h1", date: localDay(), crop: "Tomato", quantity: "6", unit: "lb", destination: "home", saleAmount: "0" }],
      experiments: [],
      expenses: [],
    }));
  });

  await page.goto("/market-planner/");
  const marketDate = await page.getByLabel("Market / pickup date", { exact: true }).inputValue();
  await page.getByLabel("Product / crop", { exact: true }).fill("Tomato");
  await page.getByLabel("Harvest target", { exact: true }).fill("8");
  await page.getByLabel("Planned market quantity", { exact: true }).fill("5");
  await page.getByLabel("Packed now", { exact: true }).fill("2");
  await page.getByLabel("Unit", { exact: true }).selectOption("lb");
  await page.getByLabel("Aggregate interest count", { exact: true }).fill("3");
  await page.getByLabel("Price per unit", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Add market item", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Tomato", exact: true })).toBeVisible();
  await expect(page.getByText("Recent 14-day Farm Records harvest signal: 6 lb. This is not automatically available stock.", { exact: true })).toBeVisible();
  await expect(page.getByText("3 lb remain to pack against the saved market quantity.", { exact: true })).toBeVisible();
  await expect(page.getByText("3 aggregate interest signals · $20.00 planned gross if all planned quantity sells.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Mark fully packed", exact: true }).click();
  await expect(page.getByText("Packing target reached for this item.", { exact: true })).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("price-family-farm-market-plan-v1")));
  expect(stored).toHaveLength(1);
  expect(stored[0].date).toBe(marketDate);
  expect(stored[0].packedQty).toBe("5");
  expect(stored[0].interestCount).toBe("3");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
