import { test, expect } from "@playwright/test";

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("home stays usable without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Grow the farm");
  await expect(page.getByRole("link", { name: "See farm availability" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("navigation exposes task-oriented destinations", async ({ page, isMobile }) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: /menu/i });
  if (isMobile && await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: /^Farm/ }).click();
  await expect(page.getByRole("link", { name: "Farm Records" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Availability" })).toBeVisible();
});

test("Farm Records persist private harvest data across reload", async ({ page }) => {
  await page.goto("/farm-records/");
  await page.getByRole("textbox", { name: "Crop" }).fill("Smoke test tomato");
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("2");
  await page.getByRole("button", { name: "Save harvest" }).click();
  await expect(page.getByText("Smoke test tomato")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Smoke test tomato")).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("price-family-farm-records-v2"));
  expect(saved).toContain("Smoke test tomato");
});

test("availability page does not claim unconfirmed stock", async ({ page }) => {
  await page.goto("/available/");
  await expect(page.getByText("This is an interest list, not a preorder.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Join the availability list" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("weather page always has a non-fabricated state", async ({ page }) => {
  await page.route("https://api.weather.gov/**", (route) => route.abort());
  await page.goto("/weather/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Use live weather");
  await expect(page.getByText("No weather values are being guessed")).toBeVisible({ timeout: 10_000 });
});
