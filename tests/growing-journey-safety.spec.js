import { Buffer } from "node:buffer";
import { test, expect } from "@playwright/test";

function validPlan(name = "Imported Journey") {
  return {
    version: 2,
    name,
    createdAt: "2026-08-29T12:00:00.000Z",
    updatedAt: null,
    crops: [],
    beds: [],
    customTasks: [],
    completed: {},
    taskOverrides: {},
    notes: "",
    location: null,
  };
}

test("Growing Journey rejects oversized and malformed imports without replacing current data", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "pff.growingJourney.v1",
      JSON.stringify({
        version: 2,
        name: "Keep this plan",
        createdAt: "2026-08-29T12:00:00.000Z",
        updatedAt: null,
        crops: [],
        beds: [],
        customTasks: [],
        completed: {},
        taskOverrides: {},
        notes: "",
        location: null,
      })
    );
  });

  await page.goto("/my-growing-journey/");

  const fileInput = page.locator('input[type="file"][accept*="application/json"]');

  const oversizedDialogPromise = page.waitForEvent("dialog");
  const oversizedUploadPromise = fileInput.setInputFiles({
    name: "oversized-growing-journey.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(750_001, 32),
  });

  const oversizedDialog = await oversizedDialogPromise;
  const oversizedMessage = oversizedDialog.message();
  await oversizedDialog.dismiss();
  await oversizedUploadPromise;

  expect(oversizedMessage).toContain(
    "larger than the allowed local safety limit"
  );

  const malformedDialogPromise = page.waitForEvent("dialog");
  const malformedUploadPromise = fileInput.setInputFiles({
    name: "malformed-growing-journey.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        ...validPlan("Bad import"),
        customTasks: [
          {
            id: "bad-task",
            title: "Bad task",
            date: 12345,
          },
        ],
      })
    ),
  });

  const malformedDialog = await malformedDialogPromise;
  const malformedMessage = malformedDialog.message();
  await malformedDialog.dismiss();
  await malformedUploadPromise;

  expect(malformedMessage).toContain(
    "custom tasks are malformed"
  );

  const storedName = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("pff.growingJourney.v1")).name
  );

  expect(storedName).toBe("Keep this plan");
});

test("Farm OS backup validates and restores both Growing Journey stores", async ({ page }) => {
  await page.goto("/farm-backup/");

  const plan = validPlan("Restored from Farm OS backup");
  const backup = {
    version: 1,
    exportedAt: "2026-08-29T12:00:00.000Z",
    stores: {
      journey: plan,
      "journey-backups": [
        {
          savedAt: "2026-08-29T12:00:00.000Z",
          plan,
        },
      ],
    },
  };

  await page
    .getByLabel("Choose Farm OS backup file")
    .setInputFiles({
      name: "farm-os-with-growing-journey.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });

  await expect(page.getByLabel("Restore My Growing Journey")).toBeVisible();
  await expect(
    page.getByLabel("Restore Growing Journey recovery snapshots")
  ).toBeVisible();

  await page.getByLabel("Type RESTORE to confirm").fill("RESTORE");
  await page.getByRole("button", { name: "Restore selected local data" }).click();

  const restored = await page.evaluate(() => ({
    plan: JSON.parse(localStorage.getItem("pff.growingJourney.v1")),
    backups: JSON.parse(localStorage.getItem("pff.growingJourney.backups.v1")),
  }));

  expect(restored.plan.name).toBe("Restored from Farm OS backup");
  expect(restored.backups).toHaveLength(1);
  expect(restored.backups[0].plan.name).toBe("Restored from Farm OS backup");
});

test("Privacy Tools can clear Growing Journey without wiping the newer Farm Planner", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "pff.growingJourney.v1",
      JSON.stringify({
        version: 2,
        name: "Journey",
        createdAt: "2026-08-29T12:00:00.000Z",
        updatedAt: null,
        crops: [],
        beds: [],
        customTasks: [],
        completed: {},
        taskOverrides: {},
        notes: "",
        location: null,
      })
    );

    localStorage.setItem(
      "pff.growingJourney.backups.v1",
      JSON.stringify([])
    );

    localStorage.setItem(
      "price-family-farm-planner-v1",
      JSON.stringify([{ crop: "Tomato" }])
    );
  });

  await page.goto("/privacy-tools/");

  await page.getByLabel("Clear Farm records").uncheck();
  await page.getByLabel("Clear Funding & education tracker").uncheck();

  await page.getByLabel("Clear My Growing Journey").check();
  await page
    .getByLabel("Clear Growing Journey recovery snapshots")
    .check();

  await page.getByLabel("Type CLEAR to confirm").fill("CLEAR");
  await page
    .getByRole("button", { name: "Clear selected local data" })
    .click();

  const state = await page.evaluate(() => ({
    journey: localStorage.getItem("pff.growingJourney.v1"),
    journeyBackups: localStorage.getItem(
      "pff.growingJourney.backups.v1"
    ),
    planner: localStorage.getItem("price-family-farm-planner-v1"),
  }));

  expect(state.journey).toBeNull();
  expect(state.journeyBackups).toBeNull();
  expect(state.planner).not.toBeNull();

  await expect(page.getByRole("status")).toContainText(
    "Cleared 2 selected local data areas"
  );
});
