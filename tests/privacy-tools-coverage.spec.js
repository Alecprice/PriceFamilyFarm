import { test, expect } from "@playwright/test";

test("privacy tools can clear recovered Farm OS stores selectively", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({ harvests: [] }));
    localStorage.setItem("price-family-farm-funding-v1", JSON.stringify([]));
    localStorage.setItem("price-family-farm-planner-v1", JSON.stringify([{ crop: "Tomato" }]));
    localStorage.setItem("price-family-farm-map-v1", JSON.stringify([{ name: "North bed" }]));
    localStorage.setItem("price-family-farm-garden-layout-v1", JSON.stringify([{ name: "Bed A" }]));
    localStorage.setItem("price-family-farm-weather-v1", JSON.stringify({ cached: true }));
  });

  await page.goto("/privacy-tools/");
  await expect(page.getByLabel("Clear Farm planner")).toBeVisible();
  await expect(page.getByLabel("Clear Schematic farm map")).toBeVisible();
  await expect(page.getByLabel("Clear Garden layout builder")).toBeVisible();

  await page.getByLabel("Clear Farm planner").check();
  await page.getByLabel("Clear Schematic farm map").check();
  await page.getByLabel("Type CLEAR to confirm").fill("CLEAR");
  await page.getByRole("button", { name: "Clear selected local data" }).click();

  const state = await page.evaluate(() => ({
    records: localStorage.getItem("price-family-farm-records-v2"),
    funding: localStorage.getItem("price-family-farm-funding-v1"),
    planner: localStorage.getItem("price-family-farm-planner-v1"),
    map: localStorage.getItem("price-family-farm-map-v1"),
    garden: localStorage.getItem("price-family-farm-garden-layout-v1"),
    weather: localStorage.getItem("price-family-farm-weather-v1"),
  }));

  expect(state.records).toBeNull();
  expect(state.funding).toBeNull();
  expect(state.planner).toBeNull();
  expect(state.map).toBeNull();
  expect(state.garden).not.toBeNull();
  expect(state.weather).not.toBeNull();
  await expect(page.getByRole("status")).toContainText("Cleared 4 selected local data areas");
});
