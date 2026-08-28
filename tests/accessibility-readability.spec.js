import { test, expect } from "@playwright/test";

test("mobile navigation keeps a 44px touch target", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "small-phone", "small-phone touch target check");
  await page.goto("/");
  const menu = page.locator('button[aria-controls="primary-nav-links"]');
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test("keyboard focus remains visibly indicated", async ({ page }) => {
  await page.goto("/");
  const homeLink = page.getByRole("link", { name: "Price Family Farm home" });
  await homeLink.focus();
  const focusStyle = await homeLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: style.outlineWidth, style: style.outlineStyle };
  });
  expect(focusStyle.style).not.toBe("none");
  expect(Number.parseFloat(focusStyle.width)).toBeGreaterThanOrEqual(3);
});

test("reduced-motion preference disables smooth scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const scrollBehavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  expect(scrollBehavior).toBe("auto");
});
