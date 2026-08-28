import { test, expect } from "@playwright/test";

test("farm planner persists crop plans and status locally", async ({ page }) => {
  await page.goto("/farm-planner/");
  await page.getByLabel("Crop").fill("Tomato");
  await page.getByLabel("Variety").fill("Cherokee Purple");
  await page.getByLabel("Bed / space").fill("Bed A");
  await page.getByLabel("Method").selectOption("Transplant");
  await page.getByLabel("Sow / start date").fill("2026-08-28");
  await page.getByLabel("Target harvest date").fill("2026-10-10");
  await page.getByRole("button", { name: "Add crop plan", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Tomato · Cherokee Purple", exact: true })).toBeVisible();
  await page.getByLabel("Update status for Tomato Cherokee Purple").selectOption("Started");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Tomato · Cherokee Purple", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("price-family-farm-planner-v1"));
  expect(saved).toContain("Cherokee Purple");
  expect(saved).toContain("Started");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
