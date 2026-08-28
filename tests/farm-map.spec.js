import { test, expect } from "@playwright/test";

test("farm map stores only schematic browser-local zone data", async ({ page }) => {
  await page.goto("/farm-map/");
  await page.getByLabel("Zone name").fill("North garden beds");
  await page.getByLabel("Zone type").selectOption("Garden bed");
  await page.getByLabel("Area (ft², optional)").fill("240");
  await page.getByLabel("Crop or use").fill("Tomatoes and basil");
  await page.getByRole("button", { name: "Add farm zone", exact: true }).click();

  await expect(page.getByText("North garden beds", { exact: true })).toBeVisible();
  await expect(page.getByText("Privacy-safe schematic only.", { exact: false })).toBeVisible();

  await page.reload();
  await expect(page.getByText("North garden beds", { exact: true })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("price-family-farm-map-v1"));
  expect(saved).toContain("North garden beds");
  expect(saved).not.toContain("latitude");
  expect(saved).not.toContain("longitude");
  expect(saved).not.toContain("address");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
