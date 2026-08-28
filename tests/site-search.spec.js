import { test, expect } from "@playwright/test";

test("site search filters the public index without network search calls", async ({ page }) => {
  const searchApiRequests = [];
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/search" || pathname.startsWith("/api/search/")) searchApiRequests.push(request.url());
  });

  await page.goto("/search/");
  await expect(page.getByRole("heading", { name: "Find the useful page without opening every menu.", exact: true })).toBeVisible();
  await page.getByLabel("Search phrase").fill("grafting");
  await expect(page.getByRole("heading", { name: "Propagation & Grafting", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Availability", exact: true })).toHaveCount(0);

  await page.getByLabel("Search phrase").fill("weather frost");
  await expect(page.getByRole("heading", { name: "Growing Conditions", exact: true })).toBeVisible();

  await page.getByLabel("Search phrase").fill("private farm records");
  await expect(page.getByText("No indexed public page matches every search term.", { exact: false })).toBeVisible();

  expect(searchApiRequests).toHaveLength(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
