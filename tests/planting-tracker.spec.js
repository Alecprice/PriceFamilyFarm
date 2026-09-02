import { test, expect } from "@playwright/test";

test("planting tracker persists production timing and links matching harvest records", async ({ page }) => {
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
    localStorage.setItem("price-family-farm-garden-layout-v1", JSON.stringify([
      { id: "b1", name: "Bed A", length: "20", width: "4", crop: "Tomato", notes: "" },
    ]));
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [{ id: "h1", date: localDay(), crop: "Tomato", variety: "Cherokee Purple", location: "Bed A", quantity: "5", unit: "lb", destination: "sold", saleAmount: "30", notes: "" }],
      experiments: [],
      expenses: [],
    }));
    localStorage.setItem("test-succession-date", localDay(7));
  });

  await page.goto("/plantings/");
  const successionDate = await page.evaluate(() => localStorage.getItem("test-succession-date"));
  await page.getByLabel("Crop", { exact: true }).fill("Tomato");
  await page.getByLabel("Variety", { exact: true }).fill("Cherokee Purple");
  await page.getByLabel("Bed / area", { exact: true }).fill("Bed A");
  await page.getByLabel("Status", { exact: true }).selectOption("Transplanted");
  await page.getByLabel("Number planted", { exact: true }).fill("12");
  await page.getByLabel("Spacing (inches)", { exact: true }).fill("18");
  await page.getByLabel("Next succession date", { exact: true }).fill(successionDate);

  // Keyboard activation exercises the same native submit path without racing the site's
  // intentional smooth scrolling on the small-phone WebKit profile.
  const saveButton = page.getByRole("button", { name: "Save planting", exact: true });
  await saveButton.focus();
  await saveButton.press("Enter");

  await expect(page.getByRole("status")).toContainText("Tomato planting saved for Bed A.");
  const plantingBoard = page.getByRole("region", { name: "Connect timing, space, and actual harvest records." });
  await expect(plantingBoard.getByRole("heading", { name: "Tomato · Cherokee Purple", exact: true })).toBeVisible();
  await expect(plantingBoard.getByText("Transplanted · Bed A · 80 ft² mapped", { exact: true })).toBeVisible();
  await expect(plantingBoard.getByText("1 linked Farm Records harvest entry · 5 lb.", { exact: true })).toBeVisible();
  await expect(plantingBoard.getByText("Next succession: " + successionDate + ".", { exact: true })).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("price-family-farm-plantings-v1")));
  expect(stored).toHaveLength(1);
  expect(stored[0].bed).toBe("Bed A");
  expect(stored[0].plantedCount).toBe("12");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
