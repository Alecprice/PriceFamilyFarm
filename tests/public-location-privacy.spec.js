import { test, expect } from "@playwright/test";

test("public contact and story pages keep location details at city or county level", async ({ page }) => {
  await page.goto("/contact/");
  await expect(page.getByText("The public site intentionally lists Greeneville and Greene County rather than a residential street address.", { exact: false })).toBeVisible();

  await page.goto("/our-story/");
  await expect(page.getByText("Price Family Farm started this year in Greeneville, Tennessee.", { exact: false })).toBeVisible();
});
