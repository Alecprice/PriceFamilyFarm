import { test, expect } from "@playwright/test";

test("Farm Today prioritizes local work and quick-captures tasks and notes without network sync", async ({ page }) => {
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
      { id: "overdue", date: localDay(-1), task: "Check irrigation", category: "Maintenance", status: "Planned", notes: "North bed" },
      { id: "today", date: localDay(), task: "Water starts", category: "Planting", status: "Planned", notes: "Before noon" },
      { id: "upcoming", date: localDay(1), task: "Harvest tomatoes", category: "Harvest", status: "In progress", notes: "Bed A" },
      { id: "done", date: localDay(), task: "Completed task", category: "Other", status: "Done", notes: "" },
    ]));
    localStorage.setItem("price-family-farm-planner-v1", JSON.stringify([
      { id: "plan-active", crop: "Tomato", variety: "Cherokee Purple", space: "Bed A", method: "Transplant", status: "Started", targetHarvestDate: localDay(10) },
      { id: "plan-paused", crop: "Pepper", variety: "", space: "Bed B", method: "Transplant", status: "Paused" },
    ]));
    localStorage.setItem("price-family-farm-journal-v1", JSON.stringify([
      { id: "journal-1", date: localDay(), title: "Dry afternoon", category: "Field note", body: "Top inch dried quickly." },
    ]));
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [{ id: "harvest-1", date: localDay(), crop: "Tomato", variety: "Cherokee Purple", quantity: "4", unit: "lb", destination: "home", saleAmount: "0", notes: "" }],
      experiments: [],
      expenses: [{ id: "expense-1", date: localDay(), category: "seed-plant", description: "Fall lettuce seed", crop: "Lettuce", amount: "12.50", notes: "" }],
    }));
  });

  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/farm-today/");

  await expect(page.getByText("Due today", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByText("Overdue open", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByText("Next 7 days", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByText("Active crop plans", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Check irrigation", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Water starts", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Harvest tomatoes", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tomato · Cherokee Purple", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dry afternoon", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fall lettuce seed", exact: true })).toBeVisible();

  await page.getByLabel("Task", { exact: true }).fill("Check row cover");
  await page.getByLabel("Notes", { exact: true }).first().fill("Before sunset");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Task added to the private Farm Calendar");
  await expect(page.getByRole("heading", { name: "Check row cover", exact: true })).toBeVisible();

  const calendar = await page.evaluate(() => JSON.parse(localStorage.getItem("price-family-farm-calendar-v1")));
  expect(calendar).toHaveLength(5);
  expect(calendar.at(-1).task).toBe("Check row cover");
  expect(calendar.at(-1).status).toBe("Planned");

  await page.getByLabel("Title", { exact: true }).fill("Wind picked up");
  await page.getByLabel("Observation / note", { exact: true }).fill("Secure lightweight covers before evening.");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Farm note saved to the private Journal");
  await expect(page.getByRole("heading", { name: "Wind picked up", exact: true })).toBeVisible();

  const journal = await page.evaluate(() => JSON.parse(localStorage.getItem("price-family-farm-journal-v1")));
  expect(journal).toHaveLength(2);
  expect(journal[0].title).toBe("Wind picked up");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("link", { name: "Back up Farm OS", exact: true })).toBeVisible();

  const contactedExternalFarmServices = requests.some((rawUrl) => {
    try {
      const hostname = new URL(rawUrl).hostname;
      return hostname === "api.weather.gov" || hostname === "api.web3forms.com";
    } catch {
      return false;
    }
  });
  expect(contactedExternalFarmServices).toBe(false);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
