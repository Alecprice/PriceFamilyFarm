import { test, expect } from "@playwright/test";

const ROUTES = [
  ["experiments", "/experiments/", "/farm-os/experiments/"],
  ["harvest", "/harvest/", "/farm-os/harvest/"],
  ["farm journal", "/farm-journal/", "/farm-os/journal/"],
  ["season timeline", "/timeline/", "/farm-os/timeline/"],
  ["farm calendar", "/farm-calendar/", "/farm-os/calendar/"],
  ["farm map", "/farm-map/", "/farm-os/map/"],
  ["farm planner", "/farm-planner/", "/farm-os/planner/"],
];

async function robotsValue(page) {
  const meta = page.locator('meta[name="robots"]');
  if ((await meta.count()) === 0) return "";
  return ((await meta.first().getAttribute("content")) || "").toLowerCase();
}

for (const [label, publicPath, privatePath] of ROUTES) {
  test(`${label} keeps public and Farm OS routes separate`, async ({ page }) => {
    await page.goto(publicPath);
    expect(await robotsValue(page)).not.toContain("noindex");

    const main = page.getByRole("main");
    await expect(main).toHaveCount(1);
    await expect(main).toHaveAttribute("id", "main-content");
    await expect(main).toHaveAttribute("tabindex", "-1");

    await page.goto(privatePath);
    expect(await robotsValue(page)).toContain("noindex");
  });
}

test("documentation preserves both official PDFs", async ({ page }) => {
  await page.goto("/documentation/");
  await expect(page.locator('a[href="/documents/price-family-farm-registration.pdf"]')).toHaveCount(1);
  await expect(page.locator('a[href="/documents/alec-price-master-farm-manager.pdf"]')).toHaveCount(1);
});
