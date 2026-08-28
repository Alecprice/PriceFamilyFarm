import { test, expect } from "@playwright/test";

test("Farm OS local backup exports known stores and restores only validated selections", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({ harvests: [{ id: "h1", crop: "Tomato" }], experiments: [], expenses: [] }));
    localStorage.setItem("price-family-farm-planner-v1", JSON.stringify([{ id: "old", crop: "Old plan", status: "Planned" }]));
  });

  await page.goto("/farm-backup/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download local Farm OS backup" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^price-family-farm-local-backup-\d{4}-\d{2}-\d{2}\.json$/);
  await expect(page.getByRole("status")).toContainText("Prepared a local backup containing 2 Farm OS data areas");

  const backup = {
    version: 1,
    exportedAt: "2026-08-28T12:00:00.000Z",
    stores: {
      planner: [{ id: "new", crop: "Cherokee Purple", status: "Started" }],
      garden: [{ id: "bed-1", name: "Bed A", length: "12", width: "4", crop: "Tomatoes" }],
      unknownRemoteStore: { token: "must-not-restore" },
    },
  };

  await page.getByLabel("Choose Farm OS backup file").setInputFiles({
    name: "farm-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });

  await expect(page.getByLabel("Restore Farm planner")).toBeChecked();
  await expect(page.getByLabel("Restore Garden layout")).toBeChecked();
  await expect(page.getByText("unknownRemoteStore", { exact: true })).toHaveCount(0);

  const restore = page.getByRole("button", { name: "Restore selected local data" });
  await expect(restore).toBeDisabled();
  await page.getByLabel("Restore Garden layout").uncheck();
  await page.getByLabel("Type RESTORE to confirm").fill("RESTORE");
  await expect(restore).toBeEnabled();
  await restore.click();

  const state = await page.evaluate(() => ({
    planner: localStorage.getItem("price-family-farm-planner-v1"),
    garden: localStorage.getItem("price-family-farm-garden-layout-v1"),
    unknown: localStorage.getItem("unknownRemoteStore"),
  }));
  expect(state.planner).toContain("Cherokee Purple");
  expect(state.garden).toBeNull();
  expect(state.unknown).toBeNull();
  await expect(page.getByRole("status")).toContainText("Restored 1 selected Farm OS data area");
});
