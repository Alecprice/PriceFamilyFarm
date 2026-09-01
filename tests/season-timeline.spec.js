import { test, expect } from "@playwright/test";

test("season timeline combines private browser records without publishing them", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [{ id: "h1", date: "2026-08-20", crop: "Tomato", variety: "Cherokee Purple", quantity: "12", unit: "lb", destination: "sold", saleAmount: "48", notes: "Strong flavor." }],
      experiments: [{ id: "e1", date: "2026-08-18", title: "Mulch comparison", crop: "Tomato", status: "running", question: "Which mulch holds moisture longer?", result: "" }],
      expenses: [{ id: "x1", date: "2026-08-17", description: "Drip fittings", category: "irrigation", crop: "Tomato", amount: "18.50", notes: "Repair parts." }],
    }));
    localStorage.setItem("price-family-farm-journal-v1", JSON.stringify([{ id: "j1", date: "2026-08-19", title: "Market feedback", category: "Market", body: "Customers asked for more slicing tomatoes." }]));
    localStorage.setItem("price-family-farm-calendar-v1", JSON.stringify([{ id: "c1", date: "2026-08-21", task: "Seed fall lettuce", category: "Planting", status: "Planned", notes: "Start in trays." }]));
  });

  await page.goto("/farm-os/timeline/");
  await expect(page.getByText("Seed fall lettuce", { exact: true })).toBeVisible();
  await expect(page.getByText("Cherokee Purple", { exact: false })).toBeVisible();
  await expect(page.getByText("Customers asked for more slicing tomatoes.", { exact: true })).toBeVisible();

  await page.getByLabel("Event type").selectOption("Journal");
  await expect(page.getByText("Market feedback", { exact: true })).toBeVisible();
  await expect(page.getByText("Seed fall lettuce", { exact: true })).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
