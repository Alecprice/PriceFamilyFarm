import { test, expect } from "@playwright/test";

test("Farm OS surfaces supply, planting, market, and recovery signals from local stores", async ({ page }) => {
  await page.addInitScript(() => {
    function localDay(offset = 0) {
      const value = new Date();
      value.setHours(12, 0, 0, 0);
      value.setDate(value.getDate() + offset);
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    localStorage.setItem("price-family-farm-inventory-v1", JSON.stringify([
      { id: "i1", name: "Potting mix", quantity: "1", reorderAt: "2", unit: "bag" },
      { id: "i2", name: "Labels", quantity: "50", reorderAt: "10", unit: "each" },
    ]));
    localStorage.setItem("price-family-farm-plantings-v1", JSON.stringify([
      { id: "p1", crop: "Lettuce", bed: "Bed C", status: "Seeded", nextSuccessionDate: localDay(7) },
      { id: "p2", crop: "Tomato", bed: "Bed A", status: "Harvesting" },
    ]));
    localStorage.setItem("price-family-farm-market-plan-v1", JSON.stringify([
      { id: "m1", date: localDay(2), product: "Tomato", marketQty: "5", packedQty: "2", interestCount: "4", status: "Planning" },
    ]));
    localStorage.setItem("price-family-farm-backup-meta-v1", JSON.stringify({ lastExportedAt: new Date().toISOString(), storeCount: 3 }));
  });

  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/farm-os/");

  const summary = page.getByLabel("Expanded Farm OS summary");
  await expect(summary.getByText("Low-stock supplies", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(summary.getByText("Active plantings", { exact: true }).locator("..").getByText("2", { exact: true })).toBeVisible();
  await expect(summary.getByText("Successions due in 14 days", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(summary.getByText("Active market items", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();

  await expect(page.getByRole("link", { name: "Open Farm Inventory →", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Plantings & Successions →", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Market Planner →", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Crop Profitability", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Weekly Work Sheet", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Data Health", exact: true })).toBeVisible();
  await expect(page.getByText("Farm OS backup prepared today", { exact: true })).toBeVisible();

  const contactedExternalFarmServices = requests.some((rawUrl) => {
    try {
      const hostname = new URL(rawUrl).hostname;
      return hostname === "api.weather.gov" || hostname === "api.web3forms.com";
    } catch {
      return false;
    }
  });
  expect(contactedExternalFarmServices).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});

test("market planner is covered by backup, privacy, and data-health allowlists", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-market-plan-v1", JSON.stringify([{ id: "m1", date: "2026-08-30", product: "Tomato", status: "Planning" }]));
  });

  await page.goto("/farm-data-health/");
  await expect(page.getByRole("heading", { name: "Market planner", exact: true })).toBeVisible();

  await page.goto("/privacy-tools/");
  await expect(page.getByLabel("Clear Market planner", { exact: true })).toBeVisible();

  await page.goto("/farm-backup/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download local Farm OS backup", exact: true }).click();
  await downloadPromise;
  await expect(page.getByRole("status")).toContainText("Prepared a local backup containing 1 Farm OS data area");
});
