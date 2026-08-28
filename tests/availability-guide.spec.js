import { test, expect } from "@playwright/test";

test("availability guide explains interest-to-confirmation flow without promising stock", async ({ page }) => {
  await page.goto("/available/");
  await expect(page.getByRole("heading", { name: "Interest first. Confirmation second. No guessed inventory.", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No preorder pressure.", exact: true })).toBeVisible();
  await expect(page.getByText("These are planning windows, not an inventory calendar. Actual availability is confirmed manually on the farm.", { exact: true })).toBeVisible();
  await expect(page.getByText("Joining the list does not reserve inventory, create a purchase obligation, or collect payment information.", { exact: true })).toBeVisible();
});
