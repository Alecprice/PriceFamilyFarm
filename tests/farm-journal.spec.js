import { test, expect } from "@playwright/test";

test("farm journal persists browser-local entries and filters them", async ({ page }) => {
  await page.goto("/farm-journal/");
  await page.getByLabel("Title", { exact: true }).fill("Irrigation repair");
  await page.getByLabel("Category", { exact: true }).selectOption("Maintenance");
  await page.getByLabel("Observation / note", { exact: true }).fill("Replaced a leaking fitting and checked the line.");
  await page.getByRole("button", { name: "Save journal entry", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Irrigation repair", exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Irrigation repair", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("price-family-farm-journal-v1"));
  expect(saved).toContain("Irrigation repair");

  await page.getByLabel("Category filter", { exact: true }).selectOption("Market");
  await expect(page.getByRole("heading", { name: "Irrigation repair", exact: true })).toHaveCount(0);
  await expect(page.getByText("No journal entries match this filter.", { exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
