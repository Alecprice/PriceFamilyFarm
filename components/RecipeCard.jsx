"use client";

import { applyRecipeSafety } from "@/lib/recipeSafety";

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
  const safeRecipe = applyRecipeSafety(recipe);

  function download() {
    const text = buildGroceryListText(safeRecipe);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(safeRecipe.title)}-grocery-list.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="recipe-card" id={slugify(safeRecipe.title)}>
      <div className="recipe-card-body">
        <h3>{safeRecipe.title}</h3>
        <div className="recipe-meta">{safeRecipe.meta}</div>

        <div className="from-farm">From the farm</div>
        <ul>
          {safeRecipe.farm.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>

        <div className="from-farm" style={{ color: "var(--clay-dark)" }}>From the pantry</div>
        <ul>
          {safeRecipe.pantry.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>

        <div className="from-farm">Method</div>
        <ol>
          {safeRecipe.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>

        {safeRecipe.safetyNote ? (
          <div
            role="note"
            aria-label="Food safety"
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderLeft: "4px solid var(--clay)",
              background: "var(--cream)",
            }}
          >
            <strong>Food safety:</strong> {safeRecipe.safetyNote}
            {safeRecipe.safetySources?.length ? (
              <div style={{ marginTop: 8, fontSize: 14 }}>
                Sources:{" "}
                {safeRecipe.safetySources.map((source, index) => (
                  <span key={source.href}>
                    {index > 0 ? " · " : ""}
                    <a href={source.href} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <button type="button" className="grocery-btn" onClick={download}>
          ⬇ Download grocery list
        </button>
      </div>
    </div>
  );
}
