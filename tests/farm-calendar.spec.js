import { test, expect } from "@playwright/test";

test("farm calendar persists tasks and updates status locally", async ({ page }) => {
  await page.goto("/farm-calendar/");
  await page.getByLabel("Task").fill("Transplant fall lettuce");
  await page.getByLabel("Category").selectOption("Planting");
  await page.getByLabel("Notes").fill("Harden starts before moving outside.");
  await page.getByRole("button", { name: "Add farm task", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Transplant fall lettuce", exact: true })).toBeVisible();

  await page.getByLabel("Update status for Transplant fall lettuce").selectOption("Done");
  await page.getByLabel("Status filter").selectOption("Done");
  await expect(page.getByRole("heading", { name: "Transplant fall lettuce", exact: true })).toBeVisible();

  await page.reload();
  await page.getByLabel("Status filter").selectOption("Done");
  await expect(page.getByRole("heading", { name: "Transplant fall lettuce", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("price-family-farm-calendar-v1"));
  expect(saved).toContain("Transplant fall lettuce");
  expect(saved).toContain("Done");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
