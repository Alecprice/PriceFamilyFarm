import { test, expect } from "@playwright/test";

test("weekly review summarizes browser-local farm activity and exports without network sync", async ({ page }) => {
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

    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [
        { id: "h1", date: localDay(-1), crop: "Tomato", variety: "Cherokee Purple", quantity: "5", unit: "lb", destination: "sold", saleAmount: "30" },
        { id: "h2", date: localDay(-8), crop: "Bean", quantity: "2", unit: "lb", destination: "home", saleAmount: "0" },
      ],
      experiments: [],
      expenses: [{ id: "e1", date: localDay(-2), description: "Potting mix", category: "soil-compost", crop: "Tomato", amount: "12" }],
    }));
    localStorage.setItem("price-family-farm-calendar-v1", JSON.stringify([
      { id: "done", date: localDay(-2), task: "Weed tomato bed", category: "Maintenance", status: "Done" },
      { id: "overdue", date: localDay(-1), task: "Check trellis", category: "Maintenance", status: "Planned" },
      { id: "upcoming", date: localDay(3), task: "Start lettuce", category: "Planting", status: "Planned" },
    ]));
    localStorage.setItem("price-family-farm-journal-v1", JSON.stringify([
      { id: "j1", date: localDay(), title: "Dry soil", category: "Field note", body: "Top inch dried fast." },
    ]));
    localStorage.setItem("price-family-farm-planner-v1", JSON.stringify([
      { id: "p1", crop: "Tomato", variety: "Cherokee Purple", status: "Harvesting" },
    ]));
  });

  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/farm-weekly-review/");

  const summary = page.getByLabel("Weekly farm review summary");
  await expect(summary.getByText("Harvest entries", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(summary.getByText("$30.00", { exact: true })).toBeVisible();
  await expect(summary.getByText("$12.00", { exact: true })).toBeVisible();
  await expect(summary.getByText("$18.00", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1 dated task marked done", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1 overdue open", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "1 due through next 7 days", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tomato", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dry soil", exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download weekly review JSON", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^price-family-farm-weekly-review-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByRole("status")).toContainText("Weekly review JSON prepared");

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
