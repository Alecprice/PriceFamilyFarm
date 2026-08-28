import { test, expect } from "@playwright/test";

test("Farm Records requires confirmation before deleting browser-local records", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [{ id: "h1", date: "2026-08-28", crop: "Tomato", variety: "Cherokee Purple", location: "Bed A", quantity: "4", unit: "lb", destination: "home", saleAmount: "", notes: "" }],
      experiments: [],
      expenses: [],
    }));
  });

  await page.goto("/farm-records/");
  await expect(page.getByRole("heading", { name: "Tomato · Cherokee Purple", exact: true })).toBeVisible();

  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain("cannot be undone");
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Delete Tomato · Cherokee Purple", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tomato · Cherokee Purple", exact: true })).toBeVisible();

  let stored = await page.evaluate(() => JSON.parse(localStorage.getItem("price-family-farm-records-v2")));
  expect(stored.harvests).toHaveLength(1);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete Tomato · Cherokee Purple", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Harvest deleted");
  await expect(page.getByRole("heading", { name: "Tomato · Cherokee Purple", exact: true })).toHaveCount(0);

  stored = await page.evaluate(() => JSON.parse(localStorage.getItem("price-family-farm-records-v2")));
  expect(stored.harvests).toHaveLength(0);
  await expect(page.getByRole("link", { name: "Open full Farm OS backup", exact: true })).toBeVisible();
});
