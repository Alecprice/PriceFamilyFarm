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

test("navigation exposes public destinations and keeps private tools behind Farm OS", async ({ page }) => {
  await page.goto("/");
  await openPrimaryNavIfCollapsed(page);

  const primaryNav = page.getByRole("navigation", { name: "Primary" });
  const farmMenu = primaryNav.getByRole("button", { name: /^Farm/ });
  await expect(farmMenu).toBeVisible();
  await farmMenu.click();
  await expect(farmMenu).toHaveAttribute("aria-expanded", "true");
  await expect(primaryNav.getByRole("link", { name: "Farm OS", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Availability", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Farm Journal", exact: true })).toBeVisible();
  await expect(primaryNav.getByRole("link", { name: "Farm Records", exact: true })).toHaveCount(0);
  await expect(primaryNav.getByRole("link", { name: "Farm Analytics", exact: true })).toHaveCount(0);
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

test("Farm OS summarizes browser-local operating data", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [
        { date: "2026-08-20", crop: "Tomato", quantity: "10", unit: "lb", destination: "sold", saleAmount: "75" },
        { date: "2026-08-21", crop: "Pepper", quantity: "5", unit: "count", destination: "home", saleAmount: "" },
      ],
      experiments: [{ date: "2026-08-18", title: "Mulch comparison", crop: "Tomato", status: "running" }],
      expenses: [{ date: "2026-08-10", crop: "Tomato", description: "Seed and potting mix", amount: "20" }],
    }));
    localStorage.setItem("price-family-farm-funding-v1", JSON.stringify([
      { name: "TAEP", status: "Watch" },
      { name: "Completed course", status: "Done" },
    ]));
  });

  await page.goto("/farm-os/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Run the farm");
  const summary = page.getByRole("group", { name: "Farm OS summary" });
  await expect(summary.getByText("2", { exact: true })).toBeVisible();
  await expect(summary.getByText("$55.00", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Farm Records", exact: false })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Farm Analytics calculates browser-local recorded cash margin", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [
        { date: "2026-08-20", crop: "Tomato", variety: "Cherokee Purple", quantity: "10", unit: "lb", destination: "sold", saleAmount: "75", notes: "" },
      ],
      experiments: [
        { date: "2026-08-18", title: "Mulch comparison", crop: "Tomato", status: "running" },
      ],
      expenses: [
        { date: "2026-08-10", crop: "Tomato", description: "Seed and potting mix", category: "seed-plant", amount: "20", notes: "" },
      ],
    }));
  });

  await page.goto("/farm-analytics/");
  await expect(page.getByRole("heading", { name: "Turn farm records into better next-season decisions.", exact: true })).toBeVisible();
  await expect(page.getByText("$55.00", { exact: true }).first()).toBeVisible();
  const cropPerformance = page.locator('section[aria-labelledby="crop-performance-heading"]');
  await expect(cropPerformance.getByRole("heading", { name: "Tomato", exact: true })).toBeVisible();
  await expect(cropPerformance.getByText("Sales $75.00 · tagged expenses $20.00", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("availability page does not claim unconfirmed stock", async ({ page }) => {
  await page.goto("/available/");
  await expect(page.getByText("Inventory is confirmed manually", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Know what is coming without pretending it is already in stock.", exact: true })).toBeVisible();
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
