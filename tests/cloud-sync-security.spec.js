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

test("unconfigured builds refuse arbitrary HTTPS sync destinations", async ({ page }) => {
  await page.goto("/farm-os/cloud-sync/");

  const button = page.getByRole("button", { name: "Pull validated cloud data to this browser" });
  await expect(button).toBeDisabled();
  await expect(page.getByText(/Production sync is disabled until NEXT_PUBLIC_FARM_SYNC_ENDPOINT is configured/)).toBeVisible();

  await page.getByLabel("Local development endpoint").fill("https://example.workers.dev");
  await page.getByLabel("Private sync token").fill("not-a-real-token");
  await page.getByLabel("Type PULL to replace matching browser data").fill("PULL");

  await expect(button).toBeDisabled();
});

test("cloud restore requires explicit PULL confirmation on an allowed loopback endpoint", async ({ page }) => {
  await page.goto("/farm-os/cloud-sync/");

  const button = page.getByRole("button", { name: "Pull validated cloud data to this browser" });
  await page.getByLabel("Local development endpoint").fill("http://localhost:8787");
  await page.getByLabel("Private sync token").fill("not-a-real-token");
  await expect(button).toBeDisabled();

  await page.getByLabel("Type PULL to replace matching browser data").fill("PULL");
  await expect(button).toBeEnabled();
});

test("connection test refuses a cloud schema that is not ready", async ({ page }) => {
  await page.route("http://localhost:8787/health", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: "schema_not_ready",
        schema: {
          name: "price-family-farm-cloud-sync",
          version: 1,
          projectId: "small-water-25690282",
        },
      }),
    });
  });

  await page.goto("/farm-os/cloud-sync/");
  await page.getByLabel("Local development endpoint").fill("http://localhost:8787");
  await page.getByLabel("Private sync token").fill("test-token");
  await page.getByRole("button", { name: "Test private connection" }).click();

  await expect(page.getByRole("status")).toContainText(
    "cloud schema is not ready at the required version",
  );
});

test("checksum mismatch stops cloud restore before browser data is replaced", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "price-family-farm-funding-v1",
      JSON.stringify([{ id: "browser-copy" }]),
    );
  });

  await page.route("http://localhost:8787/v1/documents", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        documents: [{ document_key: "funding" }],
      }),
    });
  });
  await page.route("http://localhost:8787/v1/documents/funding", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        document_key: "funding",
        schema_version: 1,
        revision: 1,
        payload: [{ id: "cloud-copy" }],
        checksum: "0".repeat(64),
      }),
    });
  });

  await page.goto("/farm-os/cloud-sync/");
  await page.getByLabel("Local development endpoint").fill("http://localhost:8787");
  await page.getByLabel("Private sync token").fill("test-token");
  await page.getByLabel("Type PULL to replace matching browser data").fill("PULL");
  await page.getByRole("button", { name: "Pull validated cloud data to this browser" }).click();

  await expect(page.getByRole("status")).toContainText(
    "integrity checksum did not match",
  );

  const storage = await page.evaluate(() => ({
    funding: JSON.parse(localStorage.getItem("price-family-farm-funding-v1") || "null"),
    recovery: localStorage.getItem("price-family-farm-pre-cloud-pull-v1"),
  }));
  expect(storage.funding).toEqual([{ id: "browser-copy" }]);
  expect(storage.recovery).toBeNull();
});

test("partial cloud upload reports confirmed progress and preserves revision checkpoints", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "price-family-farm-records-v2",
      JSON.stringify({ version: 2, entries: [] }),
    );
    localStorage.setItem(
      "price-family-farm-funding-v1",
      JSON.stringify([{ id: "funding-browser-copy" }]),
    );
  });

  let putCount = 0;
  await page.route("http://localhost:8787/v1/documents/**", async (route) => {
    if (route.request().method() !== "PUT") {
      await route.continue();
      return;
    }

    putCount += 1;
    if (putCount === 1) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "ok", revision: 1 }),
      });
      return;
    }

    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "simulated_outage" }),
    });
  });

  await page.goto("/farm-os/cloud-sync/");
  await page.getByLabel("Local development endpoint").fill("http://localhost:8787");
  await page.getByLabel("Private sync token").fill("test-token");
  await page.getByRole("button", { name: "Sync browser data to cloud" }).click();

  await expect(page.getByRole("status")).toContainText(
    "1 data area was uploaded before the next request stopped while syncing Funding & education",
  );
  await expect(page.getByRole("status")).toContainText(
    "Completed revision checkpoints were preserved",
  );
  await expect(page.getByRole("status")).toContainText("simulated_outage");

  const revisions = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("price-family-farm-cloud-sync-revisions-v1") || "{}"),
  );
  expect(revisions.records).toBe(1);
  expect(revisions.funding).toBeUndefined();
  expect(putCount).toBe(2);
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
