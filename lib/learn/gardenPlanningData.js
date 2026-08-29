export const SPACING_GOALS = [
  { id: "balanced", label: "Balanced home garden", short: "Good yield + manageable airflow", guidance: "Start near the middle of the published spacing range. This is the safest default for a humid Zone 7a/7b garden because it balances canopy coverage, harvest access and air movement." },
  { id: "yield", label: "Most harvest per square foot", short: "Intensive spacing", guidance: "Use the tighter end of a research-based intensive range only when soil fertility, irrigation, thinning, trellising and disease scouting are strong. Dense planting can raise total bed yield while producing smaller individual plants or fruit." },
  { id: "size", label: "Larger individual plants / heads", short: "Give each plant more room", guidance: "Use the wider end of the range, or the cultivar/Extension recommendation for large-head or large-fruit production. More space reduces competition for light, water and nutrients." },
  { id: "airflow", label: "Maximum airflow / disease reduction", short: "Useful in humid summers", guidance: "Favor the wide end of the plant-spacing range, keep paths open, trellis when appropriate and avoid creating a solid wall of foliage. Spacing helps disease management but does not replace resistant cultivars or sanitation." },
  { id: "easy", label: "Easy harvesting & accessibility", short: "Optimize paths, not just plants", guidance: "Keep crop spacing within the recommended range but enlarge paths, use beds reachable from the outside and place frequent-harvest crops closest to the main path." }
];

export const CROP_SPACING = [
  ["Bush beans","Legume","2–3 in","No trellis needed for bush types.","Tighter spacing closes canopy quickly; wider rows improve picking access and airflow.",["NCSU_VEG"]],
  ["Pole beans","Legume","6–12 in","Trellis vertically; keep the structure from shading shorter crops.","Vertical growth is one of the easiest ways to increase production per square foot.",["NCSU_VEG"]],
  ["Beets","Root","2–3 in","No support needed.","Harvest some young for greens/baby roots and let remaining plants size up.",["NCSU_VEG","UT_LEAFY"]],
  ["Broccoli","Brassica","6–12 in intensive; wider for large heads","No support usually needed.","Spacing is a true yield-quality decision: high density can favor smaller bunching heads, while wider spacing is used for larger single heads.",["NCSU_VEG","NCSU_BROCCOLI"]],
  ["Brussels sprouts","Brassica","14–18 in","Stake tall plants if wind exposure is strong.","Give enough room for the tall leaf canopy and access to the stalk.",["NCSU_VEG"]],
  ["Cabbage","Brassica","9–12 in intensive","No support needed.","Closer spacing generally produces smaller heads; more room supports larger heads and easier airflow.",["NCSU_VEG"]],
  ["Carrots","Root","2–3 in","No support needed.","Uniform thinning matters more than perfectly straight rows. Crowding can reduce root size and uniformity.",["NCSU_VEG"]],
  ["Cauliflower","Brassica","15–18 in","No support needed.","Favor the wider end when aiming for large heads or when disease pressure is high.",["NCSU_VEG"]],
  ["Swiss chard","Leafy green","4–6 in intensive; wider for full-size plants","No support needed.","Baby-leaf harvest can be much denser than full-size plants. Decide the harvest stage before sowing.",["NCSU_VEG","UT_LEAFY"]],
  ["Collards","Leafy green","12–15 in","No support needed.","Wider spacing supports larger mature plants; denser stands can suit smaller repeated leaf harvests if airflow stays acceptable.",["NCSU_VEG"]],
  ["Sweet corn","Warm-season","12 in intensive","Plant in blocks rather than one long single row for better wind pollination.","Do not optimize corn only for plant count; pollination layout matters.",["NCSU_VEG"]],
  ["Cucumber","Cucurbit","12 in intensive","Trellis when the cultivar and bed design allow.","Vertical training reduces footprint and can improve harvest visibility and airflow, but flowers still need pollination.",["NCSU_VEG"]],
  ["Eggplant","Solanaceae","18–24 in","Stake heavy-fruiting plants if needed.","Use the wide end for vigorous cultivars or humid, disease-prone spots.",["NCSU_VEG"]],
  ["Kale","Leafy green","6 in intensive","No support usually needed.","Baby-leaf kale can be sown much denser than plants intended for long-term full-size leaf harvest.",["NCSU_VEG","UT_LEAFY"]],
  ["Head lettuce","Leafy green","about 10 in intensive; UT gives 6–12 in by type","No support needed.","Full heads need room; baby leaf can be band-sown densely and harvested young.",["NCSU_VEG","UT_LEAFY"]],
  ["Leaf lettuce","Leafy green","4–6 in intensive; much denser for baby leaf","No support needed.","Dense band sowing works for baby leaves; separated plants work better for larger repeated harvests.",["NCSU_VEG","UT_LEAFY"]],
  ["Okra","Warm-season","12–18 in","Usually self-supporting.","Use more room for very vigorous/tall cultivars and to keep harvest lanes open.",["NCSU_VEG"]],
  ["Onion","Allium","2–4 in","No support needed.","Closer spacing is suitable for green onions or smaller bulbs; more room supports larger mature bulbs.",["NCSU_VEG"]],
  ["Peas","Legume","1–3 in","Provide netting/trellis for climbing types.","Dense trellised peas can use vertical space efficiently while leaving later-season bed space for succession crops.",["NCSU_VEG"]],
  ["Peppers","Solanaceae","9–12 in intensive","Stake/cage larger plants or heavy fruit sets when needed.","For large vigorous plants or disease-prone humid sites, choose more room rather than forcing the tightest spacing.",["NCSU_VEG"]],
  ["Potatoes","Root/tuber","10–12 in","Hill soil or mulch as appropriate.","Plant population affects tuber number and size distribution; use cultivar guidance when targeting very large or small potatoes.",["NCSU_VEG"]],
  ["Pumpkin","Cucurbit","24–36 in intensive","Allow vines to run outside the bed or use a strong trellis only for suitable fruit sizes.","The vine footprint matters more than the crown spacing; plan paths before planting.",["NCSU_VEG"]],
  ["Radish","Root","1–2 in","No support needed.","Excellent succession/interplant crop because it finishes quickly.",["NCSU_VEG"]],
  ["Spinach","Leafy green","4–6 in intensive; much denser for baby leaf","No support needed.","For baby leaf, UT describes dense grid/band production; for mature plants, thin farther apart.",["NCSU_VEG","UT_LEAFY"]],
  ["Summer squash / zucchini","Cucurbit","18–24 in intensive","Bush types usually spread.","In humid conditions, do not compress large leaves into a solid canopy just to gain another plant.",["NCSU_VEG"]],
  ["Winter squash","Cucurbit","24–36 in intensive","Run vines outside beds or trellis suitable smaller-fruited types on strong support.","Plan the mature vine path before planting.",["NCSU_VEG"]],
  ["Tomatoes","Solanaceae","18–24 in intensive","Cage, stake or trellis according to determinate/indeterminate habit.","Trellising and pruning strategy changes how tightly tomatoes can be managed. Crowding can make foliar disease management harder.",["NCSU_VEG","UT_VEG"]],
  ["Turnips","Root","3–4 in","No support needed.","If growing mainly for greens, denser young harvests can make sense; roots need thinning for size.",["NCSU_VEG","UT_LEAFY"]]
].map(([crop, category, spacing, training, notes, sourceKeys]) => ({
  crop, category, spacing, training, notes, sourceKeys,
  source: "Extension spacing guidance"
}));

export const SITE_FACTORS = [
  { id: "sun", label: "Direct sun during the growing season", help: "Most vegetables perform best with at least 6–8 hours of daylight; fruiting crops generally reward the sunniest site.", options: [
    { label: "8+ hours and little obstruction", score: 4 }, { label: "6–8 hours", score: 3 }, { label: "4–6 hours", score: 1 }, { label: "Less than 4 hours", score: -2 }
  ]},
  { id: "drainage", label: "Drainage after a soaking rain", help: "Roots need both water and oxygen. Persistent saturation is a major red flag.", options: [
    { label: "Drains well; no standing water", score: 4 }, { label: "A little slow but workable", score: 2 }, { label: "Often soggy for a day or more", score: -1 }, { label: "Regularly ponds/floods", score: -3 }
  ]},
  { id: "slope", label: "Slope and erosion", help: "A slight slope can help cold air drain; steep slopes increase runoff and erosion.", options: [
    { label: "Level to gentle slope; stable soil", score: 3 }, { label: "Moderate slope that can be managed", score: 1 }, { label: "Steep or visibly eroding", score: -3 }
  ]},
  { id: "water", label: "Irrigation access", help: "A great site becomes a bad site if watering it is so difficult that it gets skipped.", options: [
    { label: "Easy hose/drip access", score: 3 }, { label: "Manageable with a longer run", score: 1 }, { label: "Difficult / water must be hauled", score: -2 }
  ]},
  { id: "access", label: "Daily convenience", help: "Frequent harvesting, scouting and irrigation happen more reliably when the garden is on a normal walking route.", options: [
    { label: "Seen or passed every day", score: 3 }, { label: "Easy to reach but out of view", score: 2 }, { label: "Remote / awkward to reach", score: -1 }
  ]},
  { id: "trees", label: "Large trees and roots nearby", help: "Trees compete for water and nutrients and cast longer shadows outside midsummer.", options: [
    { label: "Well away from large tree canopy/root competition", score: 2 }, { label: "Some nearby trees but limited shade", score: 0 }, { label: "Under/next to large trees", score: -2 }
  ]},
  { id: "history", label: "Previous use of the ground", help: "Old orchards, treated rights-of-way, fill areas and unknown imported soil can justify extra investigation.", options: [
    { label: "Known clean garden/lawn/pasture history", score: 2 }, { label: "Some disturbance/construction but known history", score: 0 }, { label: "Unknown fill, old dump, railroad/right-of-way, heavy chemical history", score: -4 }
  ]},
  { id: "frost", label: "Cold-air / frost pocket risk", help: "Low enclosed areas can collect cold air; a slight slope can sometimes drain cold air downhill.", options: [
    { label: "Not a low pocket; decent air drainage", score: 2 }, { label: "Unsure", score: 0 }, { label: "Known low frost pocket", score: -2 }
  ]},
  { id: "wildlife", label: "Deer/rabbit pressure and fencing", help: "High wildlife pressure is manageable, but build fencing into the site decision rather than after losses begin.", options: [
    { label: "Low pressure or easy to fence", score: 2 }, { label: "Moderate pressure", score: 0 }, { label: "High pressure and difficult to fence", score: -2 }
  ]}
];
