import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 500 } });

test("homepage waits to request weather until the section approaches the viewport", async ({ page }) => {
  let nwsRequests = 0;
  await page.route("https://api.weather.gov/**", async (route) => {
    nwsRequests += 1;
    await route.abort();
  });

  await page.goto("/");
  const deferred = page.locator('[data-deferred-weather]');
  await expect(deferred).toHaveAttribute("data-deferred-weather", "waiting");
  await page.waitForTimeout(150);
  expect(nwsRequests).toBe(0);

  await deferred.scrollIntoViewIfNeeded();
  await expect(deferred).toHaveAttribute("data-deferred-weather", "loaded");
  await expect.poll(() => nwsRequests).toBeGreaterThan(0);
  await expect(page.getByText("No weather values are being guessed", { exact: false })).toBeVisible({ timeout: 10_000 });
});
