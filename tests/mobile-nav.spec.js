import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("mobile menu stays reachable and restores page scrolling", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator('button[aria-controls="primary-nav-links"]');

  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  const navLinks = page.locator("#primary-nav-links");
  await expect(navLinks).toBeVisible();
  const box = await navLinks.boundingBox();
  expect(box).not.toBeNull();
  expect(box.height).toBeLessThanOrEqual(844 - 70);

  const farmMenu = page.getByRole("button", { name: /^Farm/ });
  await farmMenu.click();
  await expect(farmMenu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Farm OS", exact: true })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});
