import { test, expect } from "@playwright/test";

test("gallery lightbox works by keyboard and restores focus", async ({ page }) => {
  await page.goto("/gallery/");

  const trigger = page.getByRole("button", { name: /Open larger photo:/ }).first();
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: /Expanded photo:/ });
  await expect(dialog).toBeVisible();

  const close = dialog.getByRole("button", { name: "Close expanded photo", exact: true });
  await expect(close).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
