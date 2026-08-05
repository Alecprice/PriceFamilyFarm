"use client";

function buildGroceryListText(recipe) {
  const lines = [
    `Price Family Farm — Grocery List`,
    `${recipe.title}`,
    "",
    "GROW / FROM THE FARM:",
    ...recipe.farm.map((i) => `[ ] ${i}`),
    "",
    "FROM THE STORE:",
    ...recipe.pantry.map((i) => `[ ] ${i}`),
    "",
    `${recipe.meta}`,
  ];
  return lines.join("\n");
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function RecipeCard({ recipe }) {
  function download() {
    const text = buildGroceryListText(recipe);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(recipe.title)}-grocery-list.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="recipe-card" id={slugify(recipe.title)}>
      <div className="recipe-card-body">
        <h3>{recipe.title}</h3>
        <div className="recipe-meta">{recipe.meta}</div>

        <div className="from-farm">From the farm</div>
        <ul>
          {recipe.farm.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>

        <div className="from-farm" style={{ color: "var(--clay-dark)" }}>From the pantry</div>
        <ul>
          {recipe.pantry.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>

        <div className="from-farm">Method</div>
        <ol>
          {recipe.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>

        <button type="button" className="grocery-btn" onClick={download}>
          ⬇ Download grocery list
        </button>
      </div>
    </div>
  );
}
