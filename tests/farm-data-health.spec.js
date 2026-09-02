import { test, expect } from "@playwright/test";

test("data health reports malformed stores and repairs duplicate IDs without overwriting broken data", async ({ page }) => {
  await page.addInitScript(() => {
    const old = new Date(Date.now() - 9 * 86_400_000).toISOString();
    localStorage.setItem("price-family-farm-calendar-v1", JSON.stringify([
      { id: "dup", date: "2026-08-28", task: "First", category: "Other", status: "Planned" },
      { id: "dup", date: "2026-08-29", task: "Second", category: "Other", status: "Planned" },
    ]));
    localStorage.setItem("price-family-farm-plantings-v1", "{broken-json");
    localStorage.setItem("price-family-farm-backup-meta-v1", JSON.stringify({ lastExportedAt: old, storeCount: 1 }));
    localStorage.setItem("price-family-farm-pre-restore-snapshot-v1", JSON.stringify({ version: 1, createdAt: new Date().toISOString(), stores: {} }));
  });

  await page.goto("/farm-data-health/");
  const summary = page.getByLabel("Farm OS data health summary");
  await expect(summary.getByText("1", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Backup reminder:", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plantings & successions", exact: true })).toBeVisible();
  await expect(page.getByText("Malformed JSON", { exact: false })).toBeVisible();
  await expect(page.getByText("1 ID issue is currently eligible for repair.", { exact: true })).toBeVisible();

  await page.getByLabel("Type REPAIR to run maintenance", { exact: true }).fill("REPAIR");
  await page.getByRole("button", { name: "Run safe ID maintenance", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Repaired 1 missing or duplicate record IDs");

  const state = await page.evaluate(() => ({
    calendar: JSON.parse(localStorage.getItem("price-family-farm-calendar-v1")),
    brokenPlantings: localStorage.getItem("price-family-farm-plantings-v1"),
    preRepair: JSON.parse(localStorage.getItem("price-family-farm-pre-repair-snapshot-v1")),
    schema: JSON.parse(localStorage.getItem("price-family-farm-schema-meta-v1")),
  }));
  expect(new Set(state.calendar.map((item) => item.id)).size).toBe(2);
  expect(state.brokenPlantings).toBe("{broken-json");
  expect(state.preRepair.reason).toBe("before-data-health-repair");
  expect(state.schema.version).toBe(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
});

test("Farm OS backup records backup age metadata and preserves a pre-restore snapshot", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-inventory-v1", JSON.stringify([{ id: "old", name: "Potting mix", quantity: "2", unit: "bag", reorderAt: "1" }]));
  });

  await page.goto("/farm-backup/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download local Farm OS backup", exact: true }).click();
  await downloadPromise;

  const meta = await page.evaluate(() => JSON.parse(localStorage.getItem("price-family-farm-backup-meta-v1")));
  expect(meta.storeCount).toBe(1);
  expect(Date.parse(meta.lastExportedAt)).not.toBeNaN();

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    stores: { inventory: [{ id: "new", name: "Potting mix", quantity: "8", unit: "bag", reorderAt: "2" }] },
  };
  await page.getByLabel("Choose Farm OS backup file", { exact: true }).setInputFiles({
    name: "inventory-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.getByLabel("Type RESTORE to confirm", { exact: true }).fill("RESTORE");
  await page.getByRole("button", { name: "Restore selected local data", exact: true }).click();

  const restored = await page.evaluate(() => ({
    inventory: JSON.parse(localStorage.getItem("price-family-farm-inventory-v1")),
    snapshot: JSON.parse(localStorage.getItem("price-family-farm-pre-restore-snapshot-v1")),
  }));
  expect(restored.inventory[0].quantity).toBe("8");
  expect(restored.snapshot.version).toBe(2);
  expect(restored.snapshot.reason).toBe("before-restore");
  expect(restored.snapshot.stores.inventory[0].quantity).toBe("2");
  expect(restored.snapshot.absent).toEqual([]);
  await expect(page.getByRole("status")).toContainText("pre-restore recovery snapshot was saved first");
});
