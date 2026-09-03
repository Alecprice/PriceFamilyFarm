import { test, expect } from "@playwright/test";

for (const route of ["/documentation", "/gallery", "/our-story"]) {
  test(`${route} exposes one main landmark with working skip navigation`, async ({ page }) => {
    await page.goto(route);

    const main = page.getByRole("main");
    await expect(main).toHaveCount(1);
    await expect(main).toHaveAttribute("id", "main-content");
    await expect(main).toHaveAttribute("tabindex", "-1");

    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toHaveCount(1);
    await expect(skip).toHaveAttribute("href", "#main-content");
    await skip.focus();
    await expect(skip).toBeVisible();
    await skip.press("Enter");
    await expect(main).toBeFocused();
  });
}
