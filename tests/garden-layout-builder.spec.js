import { test, expect } from "@playwright/test";

test("garden layout builder saves bed dimensions and totals area locally", async ({ page }) => {
  await page.goto("/learn/garden-layout-builder/");
  await page.getByLabel("Bed name").fill("Bed A");
  await page.getByLabel("Length (ft)").fill("12");
  await page.getByLabel("Width (ft)").fill("4");
  await page.getByLabel("Crop / use").fill("Tomatoes and basil");
  await page.getByRole("button", { name: "Add garden bed", exact: true }).click();

  await expect(page.getByText("Bed A", { exact: true })).toBeVisible();
  await expect(page.getByText("48 ft²", { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Bed A", { exact: true })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("price-family-farm-garden-layout-v1"));
  expect(saved).toContain("Tomatoes and basil");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
