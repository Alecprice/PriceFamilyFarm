import { test, expect } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function openPrimaryNavIfCollapsed(page) {
  // Use a stable selector rather than the button's accessible name because
  // the visible text changes from "Menu" to "Close" after it is opened.
  const menu = page.locator('button[aria-controls="primary-nav-links"]');
  if (await menu.isVisible()) {
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
  }
}

test("home stays usable without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Grow the farm");
  await expect(page.getByRole("link", { name: "See farm availability", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("navigation exposes task-oriented destinations", async ({ page }) => {
  await page.goto("/");
  await openPrimaryNavIfCollapsed(page);
  const farmMenu = page.getByRole("button", { name: /^Farm/ });
  await expect(farmMenu).toBeVisible();
  await farmMenu.click();
  await expect(farmMenu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Farm Records", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Availability", exact: true })).toBeVisible();
});

test("Farm Records persist private harvest data across reload", async ({ page }) => {
  await page.goto("/farm-records/");
  await page.getByRole("textbox", { name: "Crop", exact: true }).fill("Smoke test tomato");
  await page.getByRole("spinbutton", { name: "Quantity", exact: true }).fill("2");
  await page.getByRole("button", { name: "Save harvest", exact: true }).click();
  await expect(page.getByText("Smoke test tomato", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Smoke test tomato", { exact: true })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("price-family-farm-records-v2"));
  expect(saved).toContain("Smoke test tomato");
});

test("availability page does not claim unconfirmed stock", async ({ page }) => {
  await page.goto("/available/");
  await expect(page.getByText("This is an interest list, not a preorder.", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Join the availability list", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("weather page always has a non-fabricated state", async ({ page }) => {
  await page.route("https://api.weather.gov/**", (route) => route.abort());
  await page.goto("/weather/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Use live weather");
  await expect(page.getByText("No weather values are being guessed", { exact: false })).toBeVisible({ timeout: 10_000 });
});
