import { test, expect } from "@playwright/test";

test("Farm OS summarizes recovered planning tools without network sync", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [{ id: "h1", crop: "Tomato", saleAmount: 120 }],
      experiments: [{ id: "e1", status: "running" }],
      expenses: [{ id: "x1", amount: 20 }],
    }));
    localStorage.setItem("price-family-farm-funding-v1", JSON.stringify([{ id: "f1", status: "Researching" }]));
    localStorage.setItem("price-family-farm-planner-v1", JSON.stringify([{ id: "p1", crop: "Tomato", status: "Started" }]));
    localStorage.setItem("price-family-farm-calendar-v1", JSON.stringify([{ id: "c1", date: "2026-08-01", task: "Check irrigation", status: "Planned" }]));
    localStorage.setItem("price-family-farm-journal-v1", JSON.stringify([{ id: "j1", date: "2026-08-28", title: "Field note", body: "Dry afternoon" }]));
    localStorage.setItem("price-family-farm-garden-layout-v1", JSON.stringify([{ id: "b1", name: "Bed A", length: "12", width: "4", crop: "Tomatoes" }]));
    localStorage.setItem("price-family-farm-map-v1", JSON.stringify([{ id: "z1", name: "North bed", status: "Needs work" }]));
  });

  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/farm-os/");

  await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("$100.00", { exact: true })).toBeVisible();
  await expect(page.getByText("1 active crop plan is in this browser.", { exact: true })).toBeVisible();
  await expect(page.getByText("1 open task is past its planned date.", { exact: true })).toBeVisible();
  await expect(page.getByText("1 journal entries · 1 running experiments", { exact: true })).toBeVisible();
  await expect(page.getByText("1 garden beds · 48 ft² mapped", { exact: true })).toBeVisible();
  await expect(page.getByText("1 funding items · 1 zones need work", { exact: true })).toBeVisible();
  await expect(page.getByText("7 local Farm OS data stores detected on this device.", { exact: true })).toBeVisible();

  expect(requests.some((url) => url.includes("api.weather.gov") || url.includes("web3forms"))).toBe(false);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
