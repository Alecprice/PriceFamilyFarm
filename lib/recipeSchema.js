// Builds schema.org Recipe structured data from our recipe objects.
// Deliberately omits "image" and "aggregateRating": we don't have real
// finished-dish photography or real reviews, and fabricating either is
// against Google's structured data guidelines. Everything included here
// is either directly authored content or a straightforward parse of it.

function parseTotalTime(meta) {
  // meta looks like "Summer · 10 min · Serves 4" or "Fall · 2 hr (mostly rising) · Serves 8"
  const hrMatch = meta.match(/(\d+)\s*hr/);
  const minMatch = meta.match(/(\d+)\s*min/);
  const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  if (!hours && !mins) return undefined;
  let iso = "PT";
  if (hours) iso += `${hours}H`;
  if (mins) iso += `${mins}M`;
  return iso;
}

function parseYield(meta) {
  const servesMatch = meta.match(/Serves\s+(\d+)/i);
  if (servesMatch) return `${servesMatch[1]} servings`;
  const makesMatch = meta.match(/Makes\s+([^·]+)/i);
  if (makesMatch) return makesMatch[1].trim();
  return undefined;
}

function parseSeason(meta) {
  return meta.split("·")[0]?.trim();
}

export function buildRecipeJsonLd(recipe, siteUrl) {
  const ingredients = [...recipe.farm, ...recipe.pantry];
  const totalTime = parseTotalTime(recipe.meta);
  const recipeYield = parseYield(recipe.meta);
  const season = parseSeason(recipe.meta);

  const json = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    author: {
      "@type": "Organization",
      name: "Price Family Farm",
    },
    description: `${recipe.title}, made with ${recipe.farm.join(", ").toLowerCase()} grown at Price Family Farm in Greeneville, TN.`,
    recipeIngredient: ingredients,
    recipeInstructions: recipe.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
    recipeCuisine: "American",
    keywords: `${season}, farm-to-table, Northeast Tennessee`,
    url: siteUrl ? `${siteUrl}/recipes#${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined,
  };

  if (totalTime) json.totalTime = totalTime;
  if (recipeYield) json.recipeYield = recipeYield;

  return json;
}
