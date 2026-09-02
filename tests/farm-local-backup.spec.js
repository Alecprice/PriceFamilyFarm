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
    snapshot: JSON.parse(
      localStorage.getItem("price-family-farm-pre-restore-snapshot-v1") || "null",
    ),
  }));
  expect(state.planner).toContain("Cherokee Purple");
  expect(state.garden).toBeNull();
  expect(state.unknown).toBeNull();
  expect(state.snapshot?.version).toBe(2);
  expect(state.snapshot?.stores?.planner).toEqual([{ id: "old", crop: "Old plan", status: "Planned" }]);
  await expect(page.getByRole("status")).toContainText("Restored 1 selected Farm OS data area");
});

test("local backup recovery restores old values and removes stores that were previously absent", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "price-family-farm-planner-v1",
      JSON.stringify([{ id: "old", crop: "Old plan", status: "Planned" }]),
    );
  });

  await page.goto("/farm-backup/");

  const backup = {
    version: 1,
    exportedAt: "2026-09-01T20:00:00.000Z",
    stores: {
      planner: [{ id: "new", crop: "Cherokee Purple", status: "Started" }],
      garden: [{ id: "bed-1", name: "Bed A", length: "12", width: "4", crop: "Tomatoes" }],
    },
  };

  await page.getByLabel("Choose Farm OS backup file").setInputFiles({
    name: "farm-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.getByLabel("Type RESTORE to confirm").fill("RESTORE");
  await page.getByRole("button", { name: "Restore selected local data" }).click();

  const afterRestore = await page.evaluate(() => ({
    planner: JSON.parse(localStorage.getItem("price-family-farm-planner-v1") || "null"),
    garden: JSON.parse(localStorage.getItem("price-family-farm-garden-layout-v1") || "null"),
  }));
  expect(afterRestore.planner).toEqual([{ id: "new", crop: "Cherokee Purple", status: "Started" }]);
  expect(afterRestore.garden).toEqual([{ id: "bed-1", name: "Bed A", length: "12", width: "4", crop: "Tomatoes" }]);

  await expect(page.getByRole("heading", { name: "Undo the most recent file restore." })).toBeVisible();
  const recover = page.getByRole("button", { name: "Restore pre-file-restore browser state" });
  await expect(recover).toBeDisabled();
  await page.getByLabel("Type RECOVER to restore the pre-file-restore browser state").fill("RECOVER");
  await expect(recover).toBeEnabled();
  await recover.click();

  await expect(page.getByRole("status")).toContainText(
    "Recovered 1 prior Farm OS data area and removed 1 area",
  );

  const recovered = await page.evaluate(() => ({
    planner: JSON.parse(localStorage.getItem("price-family-farm-planner-v1") || "null"),
    garden: localStorage.getItem("price-family-farm-garden-layout-v1"),
  }));
  expect(recovered.planner).toEqual([{ id: "old", crop: "Old plan", status: "Planned" }]);
  expect(recovered.garden).toBeNull();
});
