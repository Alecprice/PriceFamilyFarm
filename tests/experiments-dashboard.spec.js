import { test, expect } from "@playwright/test";

test("experiments dashboard preserves incomplete results and filters local trials", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("price-family-farm-records-v2", JSON.stringify({
      harvests: [],
      expenses: [],
      experiments: [
        { id: "e1", date: "2026-08-27", title: "Mulch comparison", crop: "Tomato", question: "Which mulch holds moisture?", variable: "Mulch type", control: "Bare soil", measure: "Watering interval", status: "running", result: "" },
        { id: "e2", date: "2026-08-20", title: "Potting mix trial", crop: "Pepper", question: "Which mix roots best?", variable: "Mix", control: "Standard mix", measure: "Root mass", status: "complete", result: "" },
      ],
    }));
  });

  await page.goto("/experiments/");
  await expect(page.getByRole("heading", { name: "Keep trials separate from guesses.", exact: true })).toBeVisible();
  await expect(page.getByText("Result not recorded yet.", { exact: true })).toBeVisible();
  await page.getByLabel("Status").selectOption("running");
  await expect(page.getByRole("heading", { name: "Mulch comparison", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Potting mix trial", exact: true })).toHaveCount(0);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
