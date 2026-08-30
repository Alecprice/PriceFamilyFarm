import { test, expect } from "@playwright/test";

test("year-round month tabs support complete keyboard navigation", async ({ page }) => {
  await page.goto("/learn/year-round/");

  const january = page.getByRole("tab", { name: "Jan" });
  const february = page.getByRole("tab", { name: "Feb" });
  const december = page.getByRole("tab", { name: "Dec" });

  await january.click();
  await expect(january).toHaveAttribute("aria-selected", "true");
  await expect(january).toBeFocused();

  await january.press("ArrowRight");
  await expect(february).toHaveAttribute("aria-selected", "true");
  await expect(february).toBeFocused();

  await february.press("End");
  await expect(december).toHaveAttribute("aria-selected", "true");
  await expect(december).toBeFocused();

  await december.press("ArrowRight");
  await expect(january).toHaveAttribute("aria-selected", "true");
  await expect(january).toBeFocused();

  await january.press("ArrowLeft");
  await expect(december).toHaveAttribute("aria-selected", "true");
  await expect(december).toBeFocused();

  await december.press("Home");
  await expect(january).toHaveAttribute("aria-selected", "true");
  await expect(january).toBeFocused();

  const panel = page.getByRole("tabpanel");
  await expect(panel).toHaveAttribute("aria-labelledby", "month-tab-0");
});

test("only the active month tab remains in the normal tab sequence", async ({ page }) => {
  await page.goto("/learn/year-round/");

  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(12);

  const january = page.getByRole("tab", { name: "Jan" });
  await january.click();

  await expect(january).toHaveAttribute("tabindex", "0");

  for (const label of [
    "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec",
  ]) {
    await expect(
      page.getByRole("tab", { name: label })
    ).toHaveAttribute("tabindex", "-1");
  }
});
