import { test, expect } from "@playwright/test";

test("harvest dashboard summarizes browser-local harvests without mixing units", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [
        { id: "h1", date: "2026-08-27", crop: "Tomato", variety: "Cherokee Purple", quantity: "8", unit: "lb", destination: "sold", saleAmount: "40", location: "Bed 1", notes: "Good quality" },
        { id: "h2", date: "2026-08-26", crop: "Tomato", variety: "Roma", quantity: "2", unit: "tray", destination: "home", saleAmount: "0", location: "Greenhouse", notes: "" },
        { id: "h3", date: "2026-08-25", crop: "Pepper", variety: "Jalapeno", quantity: "3", unit: "lb", destination: "sold", saleAmount: "15", location: "Bed 2", notes: "" },
      ],
      experiments: [],
      expenses: [],
    }));
  });

  await page.goto("/farm-os/harvest/");
  await expect(page.getByRole("heading", { name: "See what the season is actually producing.", exact: true })).toBeVisible();
  await expect(page.getByText("$55.00", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "11 lb", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2 tray", exact: true })).toBeVisible();

  await page.getByLabel("Crop filter").selectOption("Tomato");
  await expect(page.getByText("$40.00", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "8 lb", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2 tray", exact: true })).toBeVisible();
  await expect(page.getByText("Jalapeno", { exact: false })).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
