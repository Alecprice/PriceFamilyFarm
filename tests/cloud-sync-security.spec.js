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

test("pre-pull recovery restores prior values, absences, and revisions together", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "price-family-farm-funding-v1",
      JSON.stringify([{ id: "after-cloud-pull" }]),
    );
    localStorage.setItem(
      "price-family-farm-market-plan-v1",
      JSON.stringify([{ id: "created-by-cloud-pull" }]),
    );
    localStorage.setItem(
      "price-family-farm-cloud-sync-revisions-v1",
      JSON.stringify({ funding: 4, market: 1 }),
    );
    localStorage.setItem(
      "price-family-farm-pre-cloud-pull-v1",
      JSON.stringify({
        version: 2,
        createdAt: "2026-09-01T20:00:00.000Z",
        reason: "before-cloud-pull",
        stores: {
          funding: [{ id: "before-cloud-pull" }],
        },
        absent: ["market"],
        revisions: { funding: 3 },
      }),
    );
  });

  await page.goto("/farm-os/cloud-sync/");

  await expect(
    page.getByRole("heading", {
      name: "Return to the browser state from before the last cloud pull.",
    }),
  ).toBeVisible();
  await expect(page.getByText(/covers 2 Farm OS data areas/)).toBeVisible();

  const recover = page.getByRole("button", { name: "Restore pre-pull browser state" });
  await expect(recover).toBeDisabled();
  await page.getByLabel("Type RECOVER to restore the pre-pull browser state").fill("RECOVER");
  await expect(recover).toBeEnabled();
  await recover.click();

  await expect(page.getByRole("status")).toContainText(
    "Recovered 1 prior Farm OS data area and removed 1 area",
  );

  const restored = await page.evaluate(() => ({
    funding: JSON.parse(localStorage.getItem("price-family-farm-funding-v1") || "null"),
    market: localStorage.getItem("price-family-farm-market-plan-v1"),
    revisions: JSON.parse(
      localStorage.getItem("price-family-farm-cloud-sync-revisions-v1") || "{}",
    ),
  }));

  expect(restored.funding).toEqual([{ id: "before-cloud-pull" }]);
  expect(restored.market).toBeNull();
  expect(restored.revisions).toEqual({ funding: 3 });
});
