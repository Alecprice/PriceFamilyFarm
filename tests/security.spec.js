import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

test("funding tracker refuses unsafe external URL schemes", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-funding-v1", JSON.stringify([
      {
        id: "unsafe",
        name: "Unsafe imported link",
        type: "Grant",
        status: "Research",
        deadline: "",
        url: "javascript:alert(document.domain)",
        notes: "This should render as text without an external link.",
      },
    ]));
  });

  await page.goto("/funding/");
  await expect(page.getByRole("heading", { name: "Unsafe imported link" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open official source/i })).toHaveCount(0);
});

test("CSV export neutralizes spreadsheet formulas from farm text fields", async ({ page }) => {
  await page.goto("/farm-records/");
  await page.getByRole("textbox", { name: "Crop", exact: true }).fill("=2+2");
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("1");
  await page.getByRole("button", { name: "Save harvest" }).click();

  await page.getByRole("tab", { name: "Backup & export" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV" }).click();
  const download = await downloadPromise;
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const csv = await readFile(filePath, "utf8");
  expect(csv).toContain("'=2+2");
  expect(csv).not.toContain(",=2+2,");
});

test("weather feed refuses a forecast URL outside api.weather.gov", async ({ page }) => {
  let untrustedOriginRequested = false;
  await page.route("https://evil.example/**", async (route) => {
    untrustedOriginRequested = true;
    await route.abort();
  });
  await page.route("https://api.weather.gov/points/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/geo+json",
      body: JSON.stringify({ properties: { forecast: "https://evil.example/forecast" } }),
    });
  });

  await page.goto("/weather/");
  await expect(page.getByText("No weather values are being guessed")).toBeVisible({ timeout: 10_000 });
  expect(untrustedOriginRequested).toBe(false);
});
