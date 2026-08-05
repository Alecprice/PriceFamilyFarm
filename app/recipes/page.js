export const metadata = {
  title: "Recipes · Price Family Farm",
  description: "Simple recipes built around what's actually in season at Price Family Farm, from garden tomatoes to orchard fruit.",
};

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RecipeCard from "@/components/RecipeCard";
import { buildRecipeJsonLd } from "@/lib/recipeSchema";

const RECIPES = [
  {
    title: "Garden Tomato & Herb Salad",
    meta: "Summer · 10 min · Serves 4",
    farm: ["Tomatoes", "Culinary herbs (basil, parsley)"],
    pantry: ["Olive oil", "Red wine vinegar", "Salt & pepper", "Flaky salt, to finish"],
    steps: [
      "Slice ripe tomatoes into wedges and lay them out on a platter, layering in different sizes and colors if you've got them.",
      "Tear the herbs by hand rather than chopping, and scatter over the top.",
      "Drizzle with olive oil and a splash of vinegar.",
      "Finish with flaky salt and a few cracks of black pepper right before serving.",
    ],
  },
  {
    title: "Roasted Okra & Peppers",
    meta: "Summer · 30 min · Serves 4",
    farm: ["Okra", "Peppers"],
    pantry: ["Olive oil", "Salt & pepper", "Lemon wedge"],
    steps: [
      "Heat the oven to 425°F.",
      "Halve the okra lengthwise and slice the peppers into strips.",
      "Toss both with olive oil, salt, and pepper on a sheet pan, spread in a single layer.",
      "Roast 18–22 minutes, tossing once, until the edges char lightly.",
      "Finish with a squeeze of lemon before serving.",
    ],
  },
  {
    title: "Zucchini & Squash Skillet",
    meta: "Summer · 20 min · Serves 4",
    farm: ["Zucchini", "Squash", "Tomatoes", "Culinary herbs"],
    pantry: ["Olive oil or butter", "Garlic", "Salt & pepper", "Grated parmesan (optional)"],
    steps: [
      "Slice zucchini and squash into half-moons.",
      "Warm oil or butter in a wide skillet over medium-high heat, add the squash, and let it sit undisturbed for 2–3 minutes to color before stirring.",
      "Add chopped tomatoes and garlic, cook another 4–5 minutes until just softened.",
      "Stir in torn herbs off the heat, season to taste, and top with parmesan if using.",
    ],
  },
  {
    title: "Blueberry Elderberry Jam",
    meta: "Late summer · 45 min · Makes ~3 cups",
    farm: ["Blueberries", "Elderberries"],
    pantry: ["Sugar", "Lemon juice", "Pectin (optional, for a firmer set)"],
    steps: [
      "Rinse the berries and strip elderberries from their stems.",
      "Combine berries, sugar, and lemon juice in a heavy pot and let sit 10 minutes to draw out juice.",
      "Bring to a boil, then reduce to a steady simmer, mashing berries as they soften.",
      "Simmer 20–25 minutes, stirring often, until thickened, adding pectin if you want a firmer set.",
      "Cool slightly and jar. Refrigerate for immediate use, or process in a water bath for shelf-stable jam.",
    ],
  },
  {
    title: "Pawpaw Peach Crisp",
    meta: "Late summer · 50 min · Serves 6",
    farm: ["Pawpaws", "Peaches"],
    pantry: ["Rolled oats", "Flour", "Butter", "Brown sugar", "Cinnamon"],
    steps: [
      "Heat the oven to 375°F.",
      "Scoop pawpaw pulp from the skin and seeds, and slice the peaches.",
      "Combine both in a baking dish with a spoonful of brown sugar and a pinch of cinnamon.",
      "Rub oats, flour, butter, and brown sugar together into a crumbly topping and scatter over the fruit.",
      "Bake 30–35 minutes until the topping is golden and the fruit is bubbling at the edges.",
    ],
  },
  {
    title: "Quick Pickled Cucumbers",
    meta: "Any time · 15 min + chill · Makes 1 jar",
    farm: ["Cucumbers", "Fresh dill"],
    pantry: ["Vinegar", "Water", "Sugar", "Salt", "Garlic clove (optional)"],
    steps: [
      "Slice cucumbers into thin rounds or spears and pack into a jar with dill and garlic, if using.",
      "Bring vinegar, water, sugar, and salt to a simmer until dissolved.",
      "Pour the hot brine over the cucumbers, filling the jar.",
      "Cool to room temperature, then refrigerate at least 4 hours before eating. Keeps about 2 weeks refrigerated.",
    ],
  },
  {
    title: "Fig & Herb Flatbread",
    meta: "Late summer · 25 min · Serves 4",
    farm: ["Figs", "Fresh herbs (thyme or rosemary)"],
    pantry: ["Flatbread or pizza dough", "Olive oil", "Soft cheese (goat or ricotta)", "Honey"],
    steps: [
      "Heat the oven to 450°F and brush flatbread or rolled-out dough with olive oil.",
      "Halve or quarter the figs and scatter over the dough with dollops of soft cheese.",
      "Bake 10–12 minutes until the edges are golden and the figs have softened.",
      "Scatter fresh herb leaves over the top and finish with a light drizzle of honey.",
    ],
  },
  {
    title: "Grilled Peach & Basil Salad",
    meta: "Summer · 20 min · Serves 4",
    farm: ["Peaches", "Basil"],
    pantry: ["Olive oil", "Balsamic vinegar", "Soft cheese (optional)", "Salt & pepper"],
    steps: [
      "Halve peaches and remove the pits, then brush the cut sides with olive oil.",
      "Grill or pan-sear cut-side down for 2–3 minutes until char marks form.",
      "Arrange on a platter and tear basil leaves over the top.",
      "Drizzle with balsamic vinegar, season with salt and pepper, and add cheese if using.",
    ],
  },
  {
    title: "Plum Galette",
    meta: "Late summer · 55 min · Serves 6",
    farm: ["Plums"],
    pantry: ["Pie dough", "Sugar", "Cornstarch", "Egg (for egg wash)", "Cinnamon"],
    steps: [
      "Heat the oven to 400°F. Roll out pie dough into a rough circle on a lined sheet pan.",
      "Slice plums and toss with sugar, a spoonful of cornstarch, and a pinch of cinnamon.",
      "Pile the plums in the center of the dough, leaving a 2-inch border, then fold the edges up and over.",
      "Brush the crust with egg wash and bake 35–40 minutes until deeply golden and bubbling.",
    ],
  },
  {
    title: "Cherry Clafoutis",
    meta: "Summer · 45 min · Serves 6",
    farm: ["Cherries"],
    pantry: ["Eggs", "Milk", "Flour", "Sugar", "Vanilla extract", "Butter"],
    steps: [
      "Heat the oven to 350°F and butter a baking dish, then arrange pitted cherries in the bottom.",
      "Whisk eggs, milk, flour, sugar, and vanilla into a smooth, thin batter.",
      "Pour the batter over the cherries.",
      "Bake 35–40 minutes until puffed and golden, and just set in the center. Best served warm.",
    ],
  },
  {
    title: "Pomegranate & Herb Grain Bowl",
    meta: "Fall · 25 min · Serves 4",
    farm: ["Pomegranate", "Fresh herbs (parsley or mint)"],
    pantry: ["Cooked grain (rice or farro)", "Olive oil", "Lemon juice", "Salt"],
    steps: [
      "Cook a grain of your choice and let it cool slightly.",
      "Halve the pomegranate over a bowl of water and release the seeds underwater to avoid staining.",
      "Toss the grain with olive oil, lemon juice, and salt.",
      "Top with pomegranate seeds and torn herbs just before serving.",
    ],
  },
  {
    title: "Apple & Sage Skillet",
    meta: "Fall · 20 min · Serves 4",
    farm: ["Apples", "Sage"],
    pantry: ["Butter", "Brown sugar", "Salt"],
    steps: [
      "Core and slice the apples into wedges, leaving the skin on.",
      "Melt butter in a skillet over medium heat and add the apples in a single layer.",
      "Cook 6–8 minutes, turning occasionally, until softened and lightly caramelized.",
      "Add a spoonful of brown sugar and torn sage leaves in the last minute, tossing to coat.",
    ],
  },
  {
    title: "Roasted Pear & Greens Salad",
    meta: "Fall · 25 min · Serves 4",
    farm: ["Pears", "Salad greens", "Herbs"],
    pantry: ["Olive oil", "Balsamic vinegar", "Walnuts or pecans", "Salt & pepper"],
    steps: [
      "Heat the oven to 400°F. Halve pears, core them, and toss with olive oil.",
      "Roast cut-side down for 15–18 minutes until tender and lightly browned.",
      "Toss salad greens and torn herbs with olive oil, balsamic vinegar, salt, and pepper.",
      "Top with the warm roasted pears and a scatter of nuts.",
    ],
  },
  {
    title: "Melon & Mint Salad",
    meta: "Summer · 10 min · Serves 4",
    farm: ["Melon", "Mint"],
    pantry: ["Lime juice", "Flaky salt", "Chili powder (optional)"],
    steps: [
      "Cube the melon and arrange on a platter or in a bowl.",
      "Squeeze lime juice over the top.",
      "Tear mint leaves over the melon.",
      "Finish with flaky salt and a light dusting of chili powder if you like a little heat.",
    ],
  },
  {
    title: "Okra & Tomato Stew",
    meta: "Summer · 40 min · Serves 4",
    farm: ["Okra", "Tomatoes", "Peppers", "Herbs"],
    pantry: ["Olive oil", "Onion", "Garlic", "Salt & pepper", "Rice, to serve"],
    steps: [
      "Warm olive oil in a pot and soften chopped onion, garlic, and peppers over medium heat.",
      "Add chopped tomatoes and simmer 10 minutes until they break down.",
      "Add sliced okra and simmer another 15–20 minutes, stirring occasionally, until the okra is tender and the stew has thickened.",
      "Season with salt and pepper, stir in torn herbs, and serve over rice.",
    ],
  },
  {
    title: "Stuffed Zucchini Boats",
    meta: "Summer · 40 min · Serves 4",
    farm: ["Zucchini", "Tomatoes", "Herbs", "Peppers"],
    pantry: ["Cooked grain or breadcrumbs", "Cheese", "Olive oil", "Salt & pepper"],
    steps: [
      "Heat the oven to 375°F. Halve zucchini lengthwise and scoop out the centers, leaving a shell.",
      "Chop the scooped zucchini with tomatoes, peppers, and herbs, and mix with cooked grain or breadcrumbs.",
      "Season the filling and pile it back into the zucchini shells.",
      "Top with cheese and bake 25–30 minutes until the shells are tender and the tops are golden.",
    ],
  },
  {
    title: "Cucumber & Herb Dip",
    meta: "Any time · 10 min · Serves 4",
    farm: ["Cucumbers", "Fresh herbs (dill or mint)"],
    pantry: ["Plain yogurt", "Garlic", "Lemon juice", "Salt"],
    steps: [
      "Grate the cucumber and squeeze out as much liquid as you can in a clean towel.",
      "Stir the cucumber into yogurt with minced garlic and lemon juice.",
      "Fold in chopped fresh herbs.",
      "Season with salt and chill at least 30 minutes before serving with vegetables or flatbread.",
    ],
  },
  {
    title: "Roasted Tomato Marinara",
    meta: "Late summer · 1 hr · Makes ~4 cups",
    farm: ["Tomatoes", "Herbs (basil and oregano)"],
    pantry: ["Olive oil", "Garlic", "Onion", "Salt & pepper"],
    steps: [
      "Heat the oven to 400°F. Halve tomatoes and roast cut-side up with olive oil for 35–40 minutes until soft and lightly charred.",
      "Soften chopped onion and garlic in a pot with olive oil.",
      "Add the roasted tomatoes, skins and all, and simmer 15 minutes, breaking them down with a spoon.",
      "Stir in torn herbs, season with salt and pepper, and blend or leave rustic. Freezes well for later in the year.",
    ],
  },
  {
    title: "Blueberry Peach Cobbler",
    meta: "Summer · 55 min · Serves 8",
    farm: ["Blueberries", "Peaches"],
    pantry: ["Flour", "Sugar", "Baking powder", "Butter", "Milk"],
    steps: [
      "Heat the oven to 375°F. Toss blueberries and sliced peaches with a spoonful of sugar in a baking dish.",
      "Whisk flour, sugar, and baking powder, then cut in cold butter until crumbly, and stir in milk to form a soft batter.",
      "Dollop the batter over the fruit, leaving gaps for the fruit to bubble through.",
      "Bake 35–40 minutes until the topping is golden and the fruit is bubbling at the edges.",
    ],
  },
  {
    title: "Elderberry Syrup",
    meta: "Fall · 45 min · Makes ~2 cups",
    farm: ["Elderberries"],
    pantry: ["Water", "Honey", "Fresh ginger (optional)", "Cinnamon stick (optional)"],
    steps: [
      "Strip elderberries from their stems and rinse well.",
      "Simmer the berries in water with ginger and cinnamon, if using, for 25–30 minutes until reduced by about half.",
      "Strain through a fine mesh, pressing to get all the liquid, and discard the solids.",
      "Once cooled to warm, stir in honey to taste. Refrigerate and use within a few weeks.",
    ],
  },
  {
    title: "Fig Jam",
    meta: "Late summer · 40 min · Makes ~2 cups",
    farm: ["Figs"],
    pantry: ["Sugar", "Lemon juice"],
    steps: [
      "Quarter the figs and combine with sugar and lemon juice in a heavy pot.",
      "Let sit 15 minutes to draw out the juices.",
      "Bring to a boil, then simmer 20–25 minutes, mashing occasionally, until thickened and jammy.",
      "Cool slightly and jar. Refrigerate for immediate use, or process in a water bath for shelf-stable jam.",
    ],
  },
  {
    title: "Pickled Okra",
    meta: "Summer · 15 min + chill · Makes 1 jar",
    farm: ["Okra"],
    pantry: ["Vinegar", "Water", "Salt", "Garlic clove", "Dried chili (optional)"],
    steps: [
      "Pack whole okra pods into a jar with garlic and chili, if using.",
      "Bring vinegar, water, and salt to a simmer until the salt dissolves.",
      "Pour the hot brine over the okra, filling the jar completely.",
      "Cool to room temperature, then refrigerate at least 3 days before eating for the best flavor.",
    ],
  },
  {
    title: "Pepper Relish",
    meta: "Summer · 35 min · Makes ~2 cups",
    farm: ["Peppers"],
    pantry: ["Vinegar", "Sugar", "Salt", "Mustard seed (optional)"],
    steps: [
      "Finely chop a mix of sweet and hot peppers, seeding to taste.",
      "Combine with vinegar, sugar, and salt in a pot and bring to a simmer.",
      "Cook 20–25 minutes, stirring occasionally, until thickened and the peppers are tender.",
      "Cool and jar. Keeps in the fridge for several weeks, great alongside eggs or grilled anything.",
    ],
  },
  {
    title: "Fresh Herb Butter",
    meta: "Any time · 10 min · Makes 1 log",
    farm: ["Fresh herbs (any combination)"],
    pantry: ["Butter", "Salt", "Lemon zest (optional)"],
    steps: [
      "Let butter soften at room temperature.",
      "Finely chop herbs and mash into the butter with a pinch of salt and lemon zest, if using.",
      "Roll the butter into a log using parchment paper or plastic wrap.",
      "Chill until firm, then slice as needed for vegetables, bread, or grilled meat.",
    ],
  },
  {
    title: "Caprese-Style Tomato Stack",
    meta: "Summer · 10 min · Serves 4",
    farm: ["Tomatoes", "Basil"],
    pantry: ["Fresh mozzarella", "Olive oil", "Balsamic glaze", "Salt & pepper"],
    steps: [
      "Slice tomatoes and mozzarella into rounds of similar thickness.",
      "Stack alternating slices of tomato, mozzarella, and a basil leaf.",
      "Drizzle with olive oil and balsamic glaze.",
      "Finish with salt and pepper just before serving.",
    ],
  },
  {
    title: "Garden Gazpacho",
    meta: "Summer · 20 min + chill · Serves 4",
    farm: ["Tomatoes", "Cucumbers", "Peppers", "Herbs"],
    pantry: ["Olive oil", "Red wine vinegar", "Garlic", "Salt & pepper", "Bread, for serving"],
    steps: [
      "Roughly chop tomatoes, cucumbers, peppers, and garlic.",
      "Blend everything with olive oil, vinegar, salt, and pepper until smooth.",
      "Chill at least 2 hours, the flavor comes together as it sits.",
      "Taste and adjust seasoning, then serve cold with torn herbs on top.",
    ],
  },
  {
    title: "Peach Salsa",
    meta: "Summer · 15 min · Makes ~3 cups",
    farm: ["Peaches", "Peppers", "Herbs (cilantro)"],
    pantry: ["Red onion", "Lime juice", "Salt"],
    steps: [
      "Dice peaches, peppers, and red onion into small, even pieces.",
      "Combine in a bowl with chopped cilantro.",
      "Add lime juice and salt to taste.",
      "Let sit 10 minutes before serving so the flavors meld.",
    ],
  },
  {
    title: "Cherry Tomato Confit",
    meta: "Summer · 45 min · Makes ~2 cups",
    farm: ["Cherry tomatoes", "Herbs (thyme or oregano)"],
    pantry: ["Olive oil", "Garlic", "Salt"],
    steps: [
      "Heat the oven to 300°F. Place whole cherry tomatoes in a baking dish with smashed garlic cloves and herb sprigs.",
      "Pour in enough olive oil to mostly submerge the tomatoes.",
      "Bake 40–45 minutes until the tomatoes are soft and just starting to collapse.",
      "Cool and store in the oil, refrigerated, for up to a week. Excellent spooned over bread or pasta.",
    ],
  },
  {
    title: "Zucchini Bread",
    meta: "Summer · 1 hr 10 min · Makes 1 loaf",
    farm: ["Zucchini"],
    pantry: ["Flour", "Sugar", "Eggs", "Oil", "Baking soda", "Cinnamon", "Walnuts (optional)"],
    steps: [
      "Heat the oven to 350°F and grease a loaf pan.",
      "Grate zucchini and squeeze out excess moisture in a clean towel.",
      "Whisk eggs, oil, and sugar, then fold in the zucchini.",
      "Stir in flour, baking soda, and cinnamon just until combined, fold in walnuts if using, and bake 55–65 minutes until a toothpick comes out clean.",
    ],
  },
  {
    title: "Summer Squash Fritters",
    meta: "Summer · 25 min · Serves 4",
    farm: ["Squash", "Herbs"],
    pantry: ["Flour", "Egg", "Salt & pepper", "Oil, for frying"],
    steps: [
      "Grate squash and salt it, then let sit 10 minutes and squeeze out the liquid in a towel.",
      "Mix with flour, a beaten egg, chopped herbs, and pepper into a thick batter.",
      "Drop spoonfuls into a hot, oiled skillet and flatten slightly.",
      "Fry 3–4 minutes per side until golden, and drain on paper towels before serving.",
    ],
  },
  {
    title: "Charred Okra with Lemon",
    meta: "Summer · 15 min · Serves 4",
    farm: ["Okra"],
    pantry: ["Olive oil", "Lemon", "Salt & pepper", "Red pepper flakes (optional)"],
    steps: [
      "Heat a heavy skillet until very hot.",
      "Toss whole okra pods with olive oil, salt, and pepper.",
      "Add to the dry hot skillet in a single layer and let sit undisturbed 2–3 minutes per side until charred.",
      "Finish with a squeeze of lemon and red pepper flakes if using.",
    ],
  },
  {
    title: "Apple & Herb Slaw",
    meta: "Fall · 15 min · Serves 4",
    farm: ["Apples", "Salad greens or cabbage", "Herbs (parsley or mint)"],
    pantry: ["Olive oil", "Apple cider vinegar", "Honey", "Salt & pepper"],
    steps: [
      "Thinly slice apples and shred greens or cabbage.",
      "Whisk olive oil, vinegar, honey, salt, and pepper into a quick dressing.",
      "Toss the apples and greens with the dressing.",
      "Finish with torn herbs right before serving so they stay bright.",
    ],
  },
  {
    title: "Spiced Poached Pears",
    meta: "Fall · 40 min · Serves 4",
    farm: ["Pears"],
    pantry: ["Sugar", "Water or juice", "Cinnamon stick", "Cloves"],
    steps: [
      "Peel pears, keeping the stems on, and combine sugar, water or juice, cinnamon, and cloves in a pot large enough to hold them.",
      "Bring to a simmer and add the pears, standing upright if they fit.",
      "Simmer 20–25 minutes, turning occasionally, until a knife slides in easily.",
      "Cool the pears in the liquid, then serve with a drizzle of the reduced syrup.",
    ],
  },
  {
    title: "Grilled Plum & Greens Salad",
    meta: "Late summer · 20 min · Serves 4",
    farm: ["Plums", "Salad greens", "Herbs"],
    pantry: ["Olive oil", "Balsamic vinegar", "Salt & pepper", "Soft cheese (optional)"],
    steps: [
      "Halve plums and remove the pits, then brush with olive oil.",
      "Grill or pan-sear cut-side down for 2–3 minutes until marked.",
      "Toss greens and herbs with olive oil, vinegar, salt, and pepper.",
      "Top with the warm plums and cheese if using.",
    ],
  },
  {
    title: "Cherry Herb Compote",
    meta: "Summer · 25 min · Makes ~2 cups",
    farm: ["Cherries", "Herbs (thyme or mint)"],
    pantry: ["Sugar", "Lemon juice"],
    steps: [
      "Pit the cherries and combine with sugar and lemon juice in a saucepan.",
      "Simmer 15–18 minutes, mashing some of the cherries, until thickened.",
      "Stir in finely chopped herbs off the heat.",
      "Serve warm or cold over yogurt, pancakes, or plain cake.",
    ],
  },
  {
    title: "Pomegranate Vinaigrette",
    meta: "Fall · 10 min · Makes ~1 cup",
    farm: ["Pomegranate"],
    pantry: ["Olive oil", "Red wine vinegar", "Honey", "Dijon mustard", "Salt & pepper"],
    steps: [
      "Release the pomegranate seeds into a bowl of water and drain.",
      "Muddle a third of the seeds to release their juice, then strain out the solids.",
      "Whisk the pomegranate juice with olive oil, vinegar, honey, and mustard.",
      "Stir in the remaining whole seeds and season with salt and pepper.",
    ],
  },
  {
    title: "Grape & Rosemary Focaccia",
    meta: "Fall · 2 hr (mostly rising) · Serves 8",
    farm: ["Grapes", "Rosemary"],
    pantry: ["Bread flour", "Yeast", "Olive oil", "Salt", "Flaky salt"],
    steps: [
      "Mix and knead a basic focaccia dough, then let it rise until doubled, about 1 hour.",
      "Press the dough into an oiled pan, dimpling it all over with your fingers.",
      "Press halved grapes and rosemary sprigs into the dough and let rise 30 more minutes.",
      "Drizzle with olive oil and flaky salt, then bake at 425°F for 20–25 minutes until golden.",
    ],
  },
  {
    title: "Fig & Melon Skewers",
    meta: "Late summer · 10 min · Serves 4",
    farm: ["Figs", "Melon", "Mint"],
    pantry: ["Honey", "Lime juice"],
    steps: [
      "Cube the melon and halve the figs.",
      "Thread onto skewers, alternating melon, fig, and a mint leaf.",
      "Whisk honey and lime juice and drizzle over the skewers.",
      "Serve right away, cold from the fridge if you can.",
    ],
  },
  {
    title: "Chilled Melon & Herb Soup",
    meta: "Summer · 15 min + chill · Serves 4",
    farm: ["Melon", "Herbs (mint or basil)"],
    pantry: ["Lime juice", "Salt", "Plain yogurt (optional)"],
    steps: [
      "Blend cubed melon with lime juice and a pinch of salt until smooth.",
      "Stir in a spoonful of yogurt if you want it creamier.",
      "Chill at least 1 hour.",
      "Top with torn herbs just before serving.",
    ],
  },
  {
    title: "Blueberry & Greens Salad",
    meta: "Summer · 10 min · Serves 4",
    farm: ["Blueberries", "Salad greens", "Herbs"],
    pantry: ["Olive oil", "Balsamic vinegar", "Nuts or seeds", "Soft cheese (optional)"],
    steps: [
      "Toss salad greens and torn herbs with olive oil and balsamic vinegar.",
      "Scatter blueberries over the top.",
      "Add nuts or seeds and cheese, if using.",
      "Serve right away so the greens stay crisp.",
    ],
  },
  {
    title: "Pawpaw Smoothie Bowl",
    meta: "Late summer · 10 min · Serves 2",
    farm: ["Pawpaws"],
    pantry: ["Banana", "Milk or yogurt", "Honey", "Toppings (granola, seeds)"],
    steps: [
      "Scoop pawpaw pulp away from the skin and large seeds.",
      "Blend with a frozen banana, a splash of milk or yogurt, and honey to taste.",
      "Pour into a bowl, it should be thick enough to eat with a spoon.",
      "Top with granola, seeds, or fresh fruit.",
    ],
  },
  {
    title: "Elderberry Apple Sauce",
    meta: "Fall · 35 min · Makes ~3 cups",
    farm: ["Elderberries", "Apples"],
    pantry: ["Sugar", "Cinnamon", "Water"],
    steps: [
      "Core and chop the apples, and strip elderberries from their stems.",
      "Combine both in a pot with a splash of water, sugar, and a pinch of cinnamon.",
      "Simmer 20–25 minutes until the apples break down and the mixture thickens.",
      "Mash to your preferred texture, chunky or smooth, and cool before serving or jarring.",
    ],
  },
  {
    title: "Roasted Pepper Dip",
    meta: "Summer · 35 min · Makes ~2 cups",
    farm: ["Peppers"],
    pantry: ["Olive oil", "Garlic", "Lemon juice", "Salt", "Bread or crackers, to serve"],
    steps: [
      "Heat the oven to 450°F and roast whole peppers until the skins blister and blacken, about 20–25 minutes, turning occasionally.",
      "Steam the peppers in a covered bowl for 10 minutes, then peel off the skins and remove the seeds.",
      "Blend the peppers with olive oil, garlic, lemon juice, and salt until smooth.",
      "Serve with bread or crackers, or spoon over grilled vegetables.",
    ],
  },
  {
    title: "Cucumber Melon Cooler",
    meta: "Summer · 10 min · Serves 4",
    farm: ["Cucumbers", "Melon", "Mint"],
    pantry: ["Lime juice", "Honey", "Sparkling water (optional)"],
    steps: [
      "Blend cucumber and melon together until smooth.",
      "Strain if you want a completely smooth drink, or leave it as is.",
      "Stir in lime juice and honey to taste.",
      "Serve over ice with a mint leaf, topped with sparkling water if you like it fizzy.",
    ],
  },
];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function Recipes() {
  const recipeJsonLd = RECIPES.map((r) => buildRecipeJsonLd(r, SITE_URL));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }}
      />
      <Nav />

      <header className="page-head">
        <div className="wrap">
          <span className="eyebrow on-dark">Recipes</span>
          <h1>What we actually cook with what comes off the farm.</h1>
          <p>44 simple, produce-forward recipes built around what&rsquo;s in season, from summer tomatoes and okra to orchard fruit and preserves later in the year. Every recipe lists what came from the farm versus what came from the pantry, and every card has a one-click grocery list you can download and take to the store.</p>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="recipe-grid">
            {RECIPES.map((r) => (
              <RecipeCard recipe={r} key={r.title} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
