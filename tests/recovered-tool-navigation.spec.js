import { test, expect } from "@playwright/test";

async function openPrimaryNavIfCollapsed(page) {
  const menu = page.locator('button[aria-controls="primary-nav-links"]');
  if (await menu.isVisible()) await menu.click();
}

test("primary navigation exposes public farm routes and one Farm OS doorway", async ({ page }) => {
  await page.goto("/");
  await openPrimaryNavIfCollapsed(page);

  const nav = page.getByRole("navigation", { name: "Primary" });
  const farm = nav.getByRole("button", { name: /^Farm/ });
  await farm.click();
  await expect(nav.getByRole("link", { name: "Farm Journal", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Season Timeline", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Farm OS", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Farm Inventory", exact: true })).toHaveCount(0);

  const plan = nav.getByRole("button", { name: /^Plan/ });
  await plan.click();
  await expect(nav.getByRole("link", { name: "Farm Planner", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Farm Calendar", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Farm Map", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Market Planner", exact: true })).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("Farm OS keeps private operating tools reachable after public nav cleanup", async ({ page }) => {
  await page.goto("/farm-os/");

  for (const href of [
    "/farm-records",
    "/farm-os/planner",
    "/farm-os/calendar",
    "/farm-analytics",
    "/funding",
    "/farm-inventory",
    "/plantings",
    "/market-planner",
    "/crop-profitability",
    "/weekly-work-sheet",
    "/farm-data-health",
    "/farm-backup",
  ]) {
    await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
  }
});
