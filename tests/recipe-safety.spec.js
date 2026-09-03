import { test, expect } from "@playwright/test";

test("elderberry recipes expose conservative preparation and storage guidance", async ({ page }) => {
  await page.goto("/recipes");

  const jam = page.locator("#blueberry-elderberry-jam");
  await expect(jam).toContainText("fully ripe, deep-purple elderberries");
  await expect(jam).toContainText("boil for at least 10 minutes");
  await expect(jam).toContainText("Do not use this recipe for shelf-stable canning");
  await expect(jam.getByRole("note", { name: "Food safety" })).toContainText("Refrigerator/freezer recipe only");
  await expect(jam.getByRole("link", { name: "University of Minnesota Extension elderberry safety" })).toHaveAttribute(
    "href",
    "https://extension.umn.edu/about/our-stories/news/cottage-food-connection/elderberries-the-safe-way",
  );
  await expect(jam.getByRole("link", { name: "Penn State tested elderberry jelly" })).toHaveAttribute(
    "href",
    "https://extension.psu.edu/safe-elderberry-jelly-recipe-for-canning",
  );

  for (const id of ["elderberry-syrup", "elderberry-apple-sauce"]) {
    const card = page.locator(`#${id}`);
    await expect(card).toContainText("fully ripe, deep-purple elderberries");
    await expect(card).toContainText("boil for at least 10 minutes");
    await expect(card).toContainText("not a shelf-stable canning recipe");
  }
});

test("custom fig jam stays refrigerator/freezer only and links tested canning guidance", async ({ page }) => {
  await page.goto("/recipes");

  const figJam = page.locator("#fig-jam");
  await expect(figJam).toContainText("Keep this custom version refrigerated");
  await expect(figJam).toContainText("For shelf-stable canning, use a current research-tested fig jam recipe");
  await expect(figJam.getByRole("link", { name: "National Center for Home Food Preservation tested fig jam" })).toHaveAttribute(
    "href",
    "https://nchfp.uga.edu/how/make-jam-jelly/jams/fig-jam-without-pectin/",
  );
});

test("recipe JSON-LD uses the same safety-hardened instructions as visible cards", async ({ page }) => {
  await page.goto("/recipes");

  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const recipes = JSON.parse(raw);
  const elderberryJam = recipes.find((recipe) => recipe.name === "Blueberry Elderberry Jam");
  const figJam = recipes.find((recipe) => recipe.name === "Fig Jam");

  expect(elderberryJam).toBeTruthy();
  expect(figJam).toBeTruthy();

  const elderberryInstructions = elderberryJam.recipeInstructions.map((step) => step.text).join(" ");
  const figInstructions = figJam.recipeInstructions.map((step) => step.text).join(" ");

  expect(elderberryInstructions).toContain("boil for at least 10 minutes");
  expect(elderberryInstructions).toContain("Do not use this recipe for shelf-stable canning");
  expect(figInstructions).toContain("current research-tested fig jam recipe");
  expect(`${elderberryInstructions} ${figInstructions}`).not.toContain("process in a water bath for shelf-stable jam");
});
