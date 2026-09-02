import { test, expect } from "@playwright/test";

for (const route of ["/contact", "/what-we-grow"]) {
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

test("crop overview keeps residential location private and availability language honest", async ({ page }) => {
  await page.goto("/what-we-grow");

  await expect(page.locator("body")).not.toContainText("Magnolia Dr");
  await expect(page.locator("body")).not.toContainText("active production at Price Family Farm right now");
  await expect(page.getByText(/growing, establishing, or propagating/i)).toBeVisible();
  await expect(page.getByText(/availability is confirmed separately/i)).toBeVisible();
});
