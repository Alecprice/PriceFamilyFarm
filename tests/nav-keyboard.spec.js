import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("desktop dropdown Escape closes the menu and restores trigger focus", async ({ page }) => {
  await page.goto("/");

  const farmMenu = page.getByRole("button", { name: /^Farm/ });
  await farmMenu.click();
  await expect(farmMenu).toHaveAttribute("aria-expanded", "true");

  const farmOsLink = page.getByRole("link", { name: "Farm OS", exact: true });
  await expect(farmOsLink).toBeVisible();
  await farmOsLink.focus();
  await expect(farmOsLink).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(farmMenu).toHaveAttribute("aria-expanded", "false");
  await expect(farmMenu).toBeFocused();
  await expect(farmOsLink).not.toBeVisible();
});
