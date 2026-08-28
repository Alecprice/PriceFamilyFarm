import { test, expect } from "@playwright/test";

test("story timeline uses lazy responsive images without horizontal overflow", async ({ page }) => {
  await page.goto("/our-story/");
  const images = page.locator(".entry-photo img");
  await expect(images).toHaveCount(13);
  await expect(images.first()).toHaveAttribute("loading", "lazy");

  const altTexts = await images.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("alt")));
  expect(altTexts.every((alt) => Boolean(alt?.trim()))).toBe(true);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
