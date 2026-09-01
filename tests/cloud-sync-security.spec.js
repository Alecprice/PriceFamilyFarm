import { test, expect } from "@playwright/test";

test("private cloud sync page is noindex and keeps its token out of local storage", async ({ page }) => {
  await page.goto("/farm-os/cloud-sync/");

  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/i);

  const token = `test-secret-${Date.now()}`;
  await page.getByLabel("Private sync token").fill(token);

  const storage = await page.evaluate((secret) => ({
    local: Object.values(localStorage),
    session: Object.values(sessionStorage),
    secret,
  }), token);

  expect(storage.local.some((value) => String(value).includes(storage.secret))).toBe(false);
  expect(storage.session.some((value) => String(value).includes(storage.secret))).toBe(true);
});

test("cloud restore requires explicit PULL confirmation", async ({ page }) => {
  await page.goto("/farm-os/cloud-sync/");

  const button = page.getByRole("button", { name: "Pull validated cloud data to this browser" });
  await expect(button).toBeDisabled();

  await page.getByLabel("Cloud sync endpoint").fill("https://example.workers.dev");
  await page.getByLabel("Private sync token").fill("not-a-real-token");
  await page.getByLabel("Type PULL to replace matching browser data").fill("PULL");

  await expect(button).toBeEnabled();
});
