import { test, expect } from "@playwright/test";

for (const route of ["/available", "/growing-guide"]) {
  test(`${route} exposes one main landmark with working skip navigation`, async ({ page }) => {
    await page.goto(route);

    const main = page.getByRole("main");
    await expect(main).toHaveCount(1);
    await expect(main).toHaveAttribute("id", "main-content");

    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toHaveAttribute("href", "#main-content");
    await skip.focus();
    await expect(skip).toBeVisible();
    await skip.press("Enter");
    await expect(main).toBeFocused();
  });
}

test("growing guide avoids unsupported general gypsum clay-compaction advice", async ({ page }) => {
  await page.goto("/growing-guide");

  const body = page.locator("body");
  await expect(body).not.toContainText(/gypsum to help break up compaction/i);
  await expect(body).toContainText(/organic matter used to support soil structure and drainage/i);
  await expect(body).toContainText(/soil test before changing pH or adding amendments/i);
  await expect(body).toContainText(/avoid working clay while it is wet/i);
});
