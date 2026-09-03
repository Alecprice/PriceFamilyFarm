// Public food-safety overrides for recipes whose authored copy needs stricter
// preparation or preservation boundaries. Keep this transformation shared by
// both visible recipe cards and Recipe JSON-LD so stale instructions cannot be
// exposed through a second rendering path.

const UMN_ELDERBERRY_SAFETY =
  "https://extension.umn.edu/about/our-stories/news/cottage-food-connection/elderberries-the-safe-way";
const PENN_STATE_ELDERBERRY_JELLY =
  "https://extension.psu.edu/safe-elderberry-jelly-recipe-for-canning";
const NCHFP_FIG_JAM =
  "https://nchfp.uga.edu/how/make-jam-jelly/jams/fig-jam-without-pectin/";

const SAFETY_OVERRIDES = {
  "Blueberry Elderberry Jam": {
    steps: [
      "Use only fully ripe, deep-purple elderberries. Remove and discard all stems, leaves, and unripe berries, then rinse the ripe berries well.",
      "Combine the elderberries, blueberries, sugar, and lemon juice in a heavy pot and let sit 10 minutes to draw out juice.",
      "Bring the mixture to a full boil and boil for at least 10 minutes, stirring frequently.",
      "Reduce to a steady simmer and cook another 10–15 minutes, stirring often and mashing the berries, until thickened.",
      "Cool slightly and jar. Keep this custom jam refrigerated, or freeze it for longer storage. Do not use this recipe for shelf-stable canning; use a current research-tested elderberry canning recipe exactly as written instead.",
    ],
    safetyNote:
      "Refrigerator/freezer recipe only. Elderberries must be fully ripe, cleaned of stems, leaves, and unripe fruit, and boiled for at least 10 minutes. Shelf-stable elderberry canning requires a current research-tested recipe with its exact acid, sugar, and processing directions.",
    safetySources: [
      { label: "University of Minnesota Extension elderberry safety", href: UMN_ELDERBERRY_SAFETY },
      { label: "Penn State tested elderberry jelly", href: PENN_STATE_ELDERBERRY_JELLY },
    ],
  },
  "Elderberry Syrup": {
    steps: [
      "Use only fully ripe, deep-purple elderberries. Remove and discard all stems, leaves, and unripe berries, then rinse the ripe berries well.",
      "Bring the berries and water to a full boil and boil for at least 10 minutes. Add ginger and cinnamon, if using, then reduce the heat and simmer another 15–20 minutes until reduced by about half.",
      "Strain through a fine mesh and discard the solids.",
      "Once cooled to warm, stir in honey to taste. Refrigerate and use within a few weeks, or freeze for longer storage. This is not a shelf-stable canning recipe.",
    ],
    safetyNote:
      "Refrigerator/freezer recipe only. Use fully ripe elderberries, remove stems, leaves, and unripe fruit, and boil for at least 10 minutes before consuming.",
    safetySources: [
      { label: "University of Minnesota Extension elderberry safety", href: UMN_ELDERBERRY_SAFETY },
    ],
  },
  "Elderberry Apple Sauce": {
    steps: [
      "Core and chop the apples. Use only fully ripe, deep-purple elderberries; remove and discard all stems, leaves, and unripe berries, then rinse the ripe berries well.",
      "Combine the apples, elderberries, a splash of water, sugar, and a pinch of cinnamon in a pot.",
      "Bring to a full boil and boil for at least 10 minutes, stirring frequently, then reduce the heat and simmer another 10–15 minutes until the apples break down and the mixture thickens.",
      "Mash to your preferred texture, cool promptly, and refrigerate. Freeze for longer storage. This custom mixture is not a shelf-stable canning recipe.",
    ],
    safetyNote:
      "Refrigerator/freezer recipe only. Use fully ripe elderberries, remove stems, leaves, and unripe fruit, and boil for at least 10 minutes before consuming.",
    safetySources: [
      { label: "University of Minnesota Extension elderberry safety", href: UMN_ELDERBERRY_SAFETY },
    ],
  },
  "Fig Jam": {
    steps: [
      "Quarter the figs and combine with sugar and lemon juice in a heavy pot.",
      "Let sit 15 minutes to draw out the juices.",
      "Bring to a boil, then simmer 20–25 minutes, mashing occasionally, until thickened and jammy.",
      "Cool slightly and jar. Keep this custom version refrigerated, or freeze it for longer storage. For shelf-stable canning, use a current research-tested fig jam recipe and follow its exact ingredient amounts, jar size, altitude adjustment, and processing time.",
    ],
    safetyNote:
      "This custom fig jam is for refrigerator/freezer storage. Shelf-stable fig jam should follow a current research-tested canning recipe exactly.",
    safetySources: [
      { label: "National Center for Home Food Preservation tested fig jam", href: NCHFP_FIG_JAM },
    ],
  },
};

export function applyRecipeSafety(recipe) {
  const override = SAFETY_OVERRIDES[recipe?.title];
  if (!override) return recipe;

  return {
    ...recipe,
    ...override,
    steps: [...override.steps],
    safetySources: override.safetySources.map((source) => ({ ...source })),
  };
}
