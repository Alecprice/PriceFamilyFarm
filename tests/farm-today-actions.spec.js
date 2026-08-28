import { test, expect } from "@playwright/test";

test("Farm Today can complete, reschedule, and advance browser-local work", async ({ page }) => {
  await page.addInitScript(() => {
    function localDay(offset = 0) {
      const value = new Date();
      value.setHours(12, 0, 0, 0);
      value.setDate(value.getDate() + offset);
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    localStorage.setItem("price-family-farm-calendar-v1", JSON.stringify([
      { id: "t1", date: localDay(-1), task: "Check drip line", category: "Irrigation", status: "Planned", notes: "" },
      { id: "t2", date: localDay(), task: "Weed bed", category: "Maintenance", status: "Planned", notes: "" },
    ]));
    localStorage.setItem("price-family-farm-planner-v1", JSON.stringify([
      { id: "p1", crop: "Tomato", variety: "Cherokee Purple", space: "Bed A", status: "Started" },
    ]));
  });

  await page.goto("/farm-today/");
  const actions = page.getByRole("region", { name: "Clear work and advance crop plans in place." });
  await actions.getByRole("button", { name: "Do tomorrow", exact: true }).first().click();
  await actions.getByRole("button", { name: "Done", exact: true }).click();
  await actions.getByRole("button", { name: "Advance Tomato to Transplanted", exact: true }).click();

  const state = await page.evaluate(() => ({
    calendar: JSON.parse(localStorage.getItem("price-family-farm-calendar-v1")),
    planner: JSON.parse(localStorage.getItem("price-family-farm-planner-v1")),
  }));
  expect(state.calendar.find((item) => item.id === "t1").date).not.toBe(state.calendar.find((item) => item.id === "t2").date);
  expect(state.calendar.find((item) => item.id === "t2").status).toBe("Done");
  expect(state.planner[0].status).toBe("Transplanted");
  await expect(page.getByRole("status")).toContainText("advanced to Transplanted");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
