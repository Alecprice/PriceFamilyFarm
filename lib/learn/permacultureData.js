export const PERMACULTURE_LESSONS = [
  {
    slug: "what-permaculture-is",
    title: "Permaculture without the mystique",
    level: "Beginner",
    environment: "All",
    local: "Zone 7a/7b",
    summary: "Design a garden as a connected system: soil, water, plants, insects, people, harvest, waste and time.",
    steps: [
      "Start with observation, not buying materials. Watch sun, shade, runoff, wind, frost pockets, wildlife and existing plants.",
      "Place frequently used things close to the house; put lower-maintenance systems farther away.",
      "Stack functions when it is practical: a berry hedge can produce food, slow wind, shelter birds and intercept runoff.",
      "Prefer small, reversible experiments before earthmoving or permanent structures.",
      "Measure outcomes. A method that does not work on your soil, slope, budget or body is not a good design for your site."
    ],
    methods: ["Traditional in-ground gardening", "Raised beds", "No-dig", "Containers", "Forest-garden style perennial beds", "Greenhouse and grow-tent systems"],
    caution: "Permaculture is a design framework, not a substitute for plant pathology, soil testing, engineering, pesticide labels or local regulations.",
    sourceKeys: ["UT_HOME", "UT_MGMT"]
  },
  {
    slug: "native-vs-hardy",
    title: "Native, adapted, annual, hardy and invasive are different labels",
    level: "Beginner",
    environment: "All",
    local: "Essential",
    summary: "A plant can be non-native and still grow beautifully here; a tropical plant can grow outdoors all summer and still die at the first hard frost.",
    steps: [
      "Native: occurred naturally in a region before widespread human introduction. Native status does not automatically mean 'easy in every yard.'",
      "Hardy: can survive expected winter minimum temperatures in a stated hardiness zone when otherwise properly sited.",
      "Tender annual here: grows outdoors during the warm season but is normally killed by frost. Tomatoes, peppers and basil fit this practical garden category.",
      "Tender perennial: lives for years in a warm climate but may need a greenhouse, indoor tent or protected overwintering here.",
      "Invasive: a non-native plant that spreads and causes ecological harm. Avoid plants on Tennessee invasive lists even if they are easy to grow."
    ],
    methods: ["Use hardiness-zone information for winter survival", "Use Extension/local references for crop timing", "Check TN invasive lists before planting unfamiliar ornamentals"],
    caution: "Do not use 'non-native' and 'will die here' interchangeably. The Learn library flags winter survival separately from ecological origin.",
    sourceKeys: ["UT_HOME", "UT_LANDSCAPE", "TNIPC"]
  },
  {
    slug: "site-observation",
    title: "Map the site before designing it",
    level: "Beginner",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "A one-day sketch is useful; a four-season observation log is better.",
    steps: [
      "Draw buildings, driveways, utilities, wells/septic, property edges, slopes, large trees and existing beds.",
      "Mark full sun, morning sun, afternoon sun, deep shade and seasonal shade. Repeat near the solstices.",
      "After a hard rain, map where water enters, moves, ponds and exits.",
      "On cold mornings, note frost pockets and spots that thaw first.",
      "Record prevailing wind and storm exposure.",
      "Mark daily travel paths so irrigation lines, thorny plants and beds do not fight normal life."
    ],
    methods: ["Paper base map", "Phone photos from fixed points", "Simple compass/sun app", "Rain-event walk-through"],
    caution: "Call utility-locating services and understand septic/drainage constraints before digging deeply or installing earthworks.",
    sourceKeys: ["UT_HOME"]
  },
  {
    slug: "soil-first",
    title: "Build soil before chasing fertilizers",
    level: "Beginner",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "Good soil management balances mineral fertility, organic matter, drainage, pore space and living roots.",
    steps: [
      "Get a soil test before adding lime, phosphorus or major fertilizer inputs.",
      "Correct drainage and compaction before assuming nutrients are the main limitation.",
      "Keep soil covered with mulch or living plants when practical.",
      "Add mature compost as an amendment, not as an unlimited fertilizer.",
      "Avoid repeatedly working wet clay soil; it can destroy structure and create long-lived compaction.",
      "Use crop residues and cover crops when disease pressure does not require removing infected material."
    ],
    methods: ["No-dig/top-dress", "Broadfork with minimal inversion", "Conventional tillage for a one-time reset", "Raised beds over difficult soil", "Containers with soilless media"],
    caution: "More compost is not always better. Excess phosphorus and salts can accumulate. Soil testing should guide repeated amendments.",
    sourceKeys: ["UT_HOME", "UT_MGMT"]
  },
  {
    slug: "no-dig-vs-till",
    title: "No-dig, broadfork or till: choose by problem, not ideology",
    level: "Intermediate",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "Different starting conditions justify different disturbance levels.",
    steps: [
      "Use no-dig/top-dressing where soil structure is already workable and perennial weeds are controlled.",
      "Use a broadfork to loosen compaction without fully inverting layers when the soil moisture is appropriate.",
      "A one-time tillage pass can be reasonable for establishing a garden in severely compacted or sod-bound ground, followed by reduced tillage.",
      "Do not till wet clay.",
      "After disturbance, protect soil with mulch, cover crops or crop canopy."
    ],
    methods: ["No-dig", "Broadfork", "Shallow cultivation", "One-time establishment tillage"],
    caution: "Repeated aggressive tillage can damage aggregation and accelerate organic-matter loss; never assume zero-till automatically solves drainage or compaction.",
    sourceKeys: ["UT_MGMT"]
  },
  {
    slug: "water-design",
    title: "Slow, spread and sink water — without creating a drainage problem",
    level: "Intermediate",
    environment: "Outdoor",
    local: "Humid Zone 7",
    summary: "In a humid climate, the goal is not to hold every drop everywhere; roots also need oxygen.",
    steps: [
      "Start with roof-water routing, mulch, organic matter and efficient irrigation before major earthworks.",
      "Use drip or soaker systems to wet roots rather than foliage when practical.",
      "Contour plantings can slow runoff on gentle slopes.",
      "Rain gardens belong where overflow has a safe route and water infiltrates within an appropriate period.",
      "Swales are site-specific earthworks. Confirm slope, soil infiltration and downstream consequences first.",
      "Keep standing water away from foundations, septic systems and crops that need well-drained root zones."
    ],
    methods: ["Drip irrigation", "Rain barrel/cistern", "Rain garden", "Contour strips", "Professionally planned swales"],
    caution: "Do not build a berm or swale that acts like an unintended dam. Saturated roots encourage root disease and slope/drainage mistakes can affect structures or neighbors.",
    sourceKeys: ["UT_MGMT", "UT_HOME"]
  },
  {
    slug: "bed-styles",
    title: "Choose a bed style that fits the site and the gardener",
    level: "Beginner",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "There is no single 'permaculture bed.' Choose for drainage, access, soil, cost and maintenance.",
    steps: [
      "In-ground rows are inexpensive and work well where soil is suitable.",
      "Permanent low beds reduce repeated layout and compaction from foot traffic.",
      "Raised beds improve access and can improve drainage but dry faster and require imported media/material.",
      "Containers make gardening possible on patios, for renters and for gardeners who need waist-height access.",
      "Hugelkultur-style woody beds can settle dramatically and can temporarily tie up nitrogen at interfaces; keep large woody material away from places where stable paths or structures are needed."
    ],
    methods: ["In-ground", "Permanent beds", "Raised beds", "Containers", "Table-height planters"],
    caution: "Do not use treated/contaminated waste material in food beds. Design bed width so the center can be reached without stepping into the soil.",
    sourceKeys: ["UT_HOME", "UT_MGMT"]
  },
  {
    slug: "composting",
    title: "Compost five ways",
    level: "Beginner",
    environment: "All",
    local: "Zone 7a/7b",
    summary: "Turn waste into a managed soil amendment using the method that fits your space and pace.",
    steps: [
      "Hot compost: mix carbon-rich and nitrogen-rich materials, maintain moisture like a wrung sponge and turn for aeration.",
      "Cold compost: slower and easier; add appropriate plant/kitchen material and allow long decomposition.",
      "Leaf mold: compost leaves largely by fungal decomposition for a useful soil-conditioning material.",
      "Worm bin: useful indoors or in protected spaces; prevent temperature extremes, excess liquid and overfeeding.",
      "Trench/spot compost: bury suitable kitchen scraps away from immediate root disturbance and animal access."
    ],
    methods: ["Hot pile", "Cold pile", "Leaf mold", "Vermicompost", "Trench compost"],
    caution: "Keep diseased material, invasive propagules and persistent herbicide-contaminated manure/hay out of beds unless you know your process makes them safe. Animal products can attract pests in simple home piles.",
    sourceKeys: ["UT_HOME"]
  },
  {
    slug: "mulches",
    title: "Mulch is a tool, not a religion",
    level: "Beginner",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "Mulch moderates moisture, suppresses weeds and protects soil, but the wrong material or thickness can create problems.",
    steps: [
      "Use clean leaves, straw, aged arborist chips or other appropriate materials based on the crop and path/bed use.",
      "Keep mulch pulled back from trunks, crowns and tender stems.",
      "Top up thin areas rather than automatically adding deep layers every year.",
      "Watch for slugs, rodents and persistent wetness where heavy mulch is used.",
      "Use living mulches only where they will not outcompete young crops."
    ],
    methods: ["Leaf mulch", "Clean straw", "Wood chips around perennials/paths", "Living groundcovers", "Landscape fabric only for specific uses"],
    caution: "Do not import hay, manure or compost of unknown herbicide history into vegetable beds. Avoid burying tree trunks and perennial crowns.",
    sourceKeys: ["UT_MGMT"]
  },
  {
    slug: "plant-guilds",
    title: "Plant guilds: design by function, then verify the horticulture",
    level: "Intermediate",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "Useful plant communities combine compatible light, water, root-space and management needs.",
    steps: [
      "Choose the main crop or perennial first.",
      "Add pollinator resources with overlapping bloom times.",
      "Add ground cover only if it will not compete heavily with the main plant.",
      "Use nitrogen-fixing species where they fit, but remember nitrogen becomes available through actual biological processes and management — not magic proximity.",
      "Add insectary flowers and habitat for natural enemies.",
      "Maintain airflow around disease-prone fruit and vegetables."
    ],
    methods: ["Fruit-tree understory", "Berry hedge + flowering border", "Vegetable + insectary strip", "Herb/pollinator bed"],
    caution: "Be skeptical of unsupported 'dynamic accumulator' claims or companion-plant lists that promise pest immunity. Compatibility, timing and observation matter more than folklore.",
    sourceKeys: ["PSU_BENEFICIALS", "PSU_POLLINATORS"]
  },
  {
    slug: "annual-vegetable-system",
    title: "Design an annual vegetable system for a long Zone 7 season",
    level: "Beginner",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "Use cool-season, warm-season and fall crops instead of treating the garden as one spring planting.",
    steps: [
      "Use Extension planting windows as a starting point, then adjust for your site's frost pocket, elevation and microclimate.",
      "Plant cool-season crops before summer heat.",
      "Wait for suitable soil and air temperatures before warm-season crops.",
      "Use succession sowing for beans, greens, roots and other crops where repeated harvests are useful.",
      "Begin many fall crops while summer crops are still producing.",
      "Record actual first/last frost and crop performance each year to build a farm-specific calendar."
    ],
    methods: ["Direct sow", "Transplants", "Succession planting", "Interplant short crops", "Fall garden"],
    caution: "Hardiness-zone number describes winter minimums, not your exact last-frost date or summer heat. Use local weather and crop-specific guidance.",
    sourceKeys: ["UT_VEG", "UT_FRUIT_CAL"]
  },
  {
    slug: "perennial-foods",
    title: "Perennial foods: design for years, not weeks",
    level: "Intermediate",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "Fruit trees, berries, perennial herbs and selected perennial vegetables need spacing, pollination and disease planning from day one.",
    steps: [
      "Match species/cultivar chill, hardiness and disease resistance to the region.",
      "Plan mature canopy and root space before planting.",
      "Confirm whether the cultivar is self-fruitful or needs a compatible pollinizer.",
      "Keep airflow around fruit plantings in humid summers.",
      "Design harvest access, mowing/paths, irrigation and wildlife protection before the plants are large."
    ],
    methods: ["Orchard rows", "Mixed edible hedge", "Berry patch", "Herbaceous perennial bed"],
    caution: "A plant being hardy in Zone 7 does not guarantee it will fruit well; chill requirements, bloom timing, late frost and disease pressure also matter.",
    sourceKeys: ["UT_HOME", "UT_LANDSCAPE"]
  },
  {
    slug: "pollinator-support",
    title: "Build pollination into the garden",
    level: "Beginner",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "A productive garden needs more than honey bees: native bees, flies, beetles, butterflies and moths contribute to pollination and food webs.",
    steps: [
      "Provide flowers from early spring through fall rather than one short bloom burst.",
      "Include different flower shapes and sizes.",
      "Leave some undisturbed nesting habitat and hollow/pithy stems where safe and appropriate.",
      "Provide clean shallow water without creating mosquito habitat.",
      "Avoid spraying blooming plants and reduce broad-spectrum pesticide use.",
      "Grow host plants where you can tolerate caterpillar feeding."
    ],
    methods: ["Native flowering border", "Insectary strips", "Herb flowers", "Messier habitat corner", "Reduced fall cleanup"],
    caution: "A sterile garden can be hard on beneficial insects. But unmanaged weeds can also host pests/disease; choose intentional habitat rather than neglect.",
    sourceKeys: ["PSU_POLLINATORS", "PSU_BENEFICIALS"]
  },
  {
    slug: "season-extension",
    title: "Season extension without confusing protection with pollination",
    level: "Intermediate",
    environment: "Outdoor + Protected",
    local: "Zone 7a/7b",
    summary: "Row cover, low tunnels, cold frames and greenhouses extend seasons and exclude pests, but they also change airflow, temperature and insect access.",
    steps: [
      "Use lightweight row covers to exclude certain pests when crop biology allows.",
      "Vent tunnels/cold frames before sunny days overheat plants.",
      "Remove or open insect-excluding covers when bee-pollinated fruiting crops begin flowering unless you are hand-pollinating.",
      "Watch humidity and condensation in protected structures.",
      "Harden transplants gradually before moving them outdoors."
    ],
    methods: ["Floating row cover", "Insect mesh", "Low tunnel", "Cold frame", "Unheated greenhouse"],
    caution: "A net can exclude pollinators and beneficial predators along with pests. It can also trap a pest underneath if eggs, soil-stage pests or infested transplants are already inside.",
    sourceKeys: ["NCSU_IPM", "UT_INSECTS", "UT_VEG"]
  },
  {
    slug: "greenhouse",
    title: "Greenhouse growing in a humid four-season climate",
    level: "Intermediate",
    environment: "Greenhouse",
    local: "Protected culture",
    summary: "A greenhouse changes the calendar but does not eliminate weather, disease, insects or pollination needs.",
    steps: [
      "Measure minimum night temperature, sunny-day maximum, humidity and root-zone temperature.",
      "Provide ventilation and air circulation; avoid persistent leaf condensation.",
      "Quarantine new plants before mixing them with established crops.",
      "Use clean containers/media and sanitize tools when disease is suspected.",
      "Scout undersides of leaves for aphids, whiteflies, mites and thrips.",
      "Plan pollination: vibration/air movement may help tomatoes; cucurbits often need insect access or hand pollination."
    ],
    methods: ["Unheated greenhouse", "Frost-protected house", "Heated winter production", "Seedling house"],
    caution: "Do not assume a 'Zone 10' perennial becomes outdoor-hardy because it survived inside. Move tender plants outdoors only when temperatures are appropriate and return/replace them before damaging cold.",
    sourceKeys: ["NCSU_PATH", "UT_DISEASE"]
  },
  {
    slug: "grow-tent",
    title: "Indoor grow tents: a separate climate that you control",
    level: "Intermediate",
    environment: "Indoor",
    local: "Indoor only",
    summary: "Lights, airflow, irrigation, sanitation and pest exclusion replace many outdoor ecosystem services.",
    steps: [
      "Match light intensity and photoperiod to crop stage.",
      "Provide air exchange and internal air movement.",
      "Prevent runoff/electrical conflicts and use equipment designed for damp horticultural environments.",
      "Scout every new plant before introducing it.",
      "Use yellow/blue sticky cards for monitoring where appropriate, not as the only control.",
      "Hand pollinate or mechanically vibrate crops that need it."
    ],
    methods: ["Seed starting", "Leafy greens", "Herbs", "Overwintering tender plants", "Experimental fruiting crops"],
    caution: "Indoor production does not make a tropical or tender plant safe to plant permanently outdoors in Zone 7a/7b. Label protected-culture plants clearly.",
    sourceKeys: ["NCSU_PATH"]
  },
  {
    slug: "integrated-pest-management",
    title: "Use an IPM ladder instead of spraying on a calendar",
    level: "All levels",
    environment: "All",
    local: "Zone 7a/7b",
    summary: "Identify the organism, decide whether the damage matters, then use the least disruptive effective control.",
    steps: [
      "Inspect plants routinely, including leaf undersides and stems.",
      "Identify pest, beneficial, disease or abiotic problem before acting.",
      "Decide whether population/damage justifies intervention.",
      "Use prevention and cultural controls first where practical.",
      "Use hand removal, barriers, traps or pruning for localized problems.",
      "Protect predators, parasitoids and pollinators.",
      "If a pesticide is warranted, use a product labeled for the crop/pest and follow the current label exactly."
    ],
    methods: ["Cultural", "Mechanical", "Biological", "Physical barriers", "Targeted labeled pesticide"],
    caution: "Never treat an unidentified problem 'just in case.' Many pesticide applications fail because the problem is disease, weather, nutrition or a beneficial insect.",
    sourceKeys: ["UT_INSECTS", "NCSU_IPM"]
  },
  {
    slug: "crop-rotation",
    title: "Rotation and succession: manage time as another dimension",
    level: "Intermediate",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "Rotation can reduce buildup of some crop-family pests and pathogens, while succession keeps space productive.",
    steps: [
      "Group crops by botanical family, not by how they are cooked.",
      "Avoid planting the same family in the same bed repeatedly where a soilborne problem is known.",
      "Remember that a small home garden may not provide enough distance/years for rotation alone to control every disease.",
      "Use cover crops or nonhost crops between susceptible plantings where practical.",
      "Keep a simple bed map so next year does not depend on memory."
    ],
    methods: ["Family rotation", "Cover-crop interval", "Succession sowing", "Interplanting"],
    caution: "Rotation is not a cure-all. Windborne spores, insect-vectored diseases and long-lived soil pathogens may require additional management.",
    sourceKeys: ["UT_DISEASE", "UT_INSECTS"]
  },
  {
    slug: "seed-saving",
    title: "Seed saving, propagation and genetic resilience",
    level: "Intermediate",
    environment: "All",
    local: "Zone 7a/7b",
    summary: "Save seed deliberately, understanding pollination biology, disease risk and hybrid genetics.",
    steps: [
      "Start with open-pollinated varieties when you want reasonably repeatable seed-grown traits.",
      "Learn whether the crop self-pollinates or readily crosses.",
      "Select seed from healthy, true-to-type plants.",
      "Do not save seed from severely diseased plants when the pathogen may be seedborne.",
      "Dry and label seed with crop, variety, year and notes.",
      "For vegetative propagation, use clean mother plants and clean tools."
    ],
    methods: ["Dry seed", "Wet-fermented seed", "Cuttings", "Division", "Layering", "Grafting where appropriate"],
    caution: "Seeds from F1 hybrids can produce variable offspring. Seed saving can also preserve disease if sanitation and crop-specific guidance are ignored.",
    sourceKeys: ["UT_VEG", "UT_DISEASE"]
  },
  {
    slug: "accessible-gardening",
    title: "Design a garden for children, aging bodies and limited mobility",
    level: "Beginner",
    environment: "All",
    local: "Universal",
    summary: "A garden should fit the person, not force the person to fit the garden.",
    steps: [
      "Use table-height or waist-height containers when bending is difficult.",
      "Keep bed widths within comfortable reach from one or both sides.",
      "Use stable, wide paths with a firm surface.",
      "Automate repetitive irrigation with timers while still checking soil moisture.",
      "Use lightweight tools, vertical trellises and harvest-height crops.",
      "Create small complete modules so someone can garden successfully without maintaining a large plot."
    ],
    methods: ["Container garden", "Raised accessible beds", "Vertical garden", "Drip/timer", "Small-zone kitchen garden"],
    caution: "Avoid narrow unstable paths, trip-hazard hoses and beds that require stepping over borders. Heat exposure is a major ergonomic concern in summer.",
    sourceKeys: ["UT_HOME"]
  },
  {
    slug: "thirty-day-start",
    title: "30-day beginner launch plan",
    level: "Beginner",
    environment: "Outdoor",
    local: "Zone 7a/7b",
    summary: "Start small enough to learn your site rather than building a farm-scale system on day one.",
    steps: [
      "Days 1–7: map sun/water, choose a small garden area, order a soil test, list foods you actually eat.",
      "Days 8–14: prepare one or two beds/containers, solve irrigation, source clean compost/mulch.",
      "Days 15–21: plant crops appropriate for the current season, add a small flower/insectary strip and begin a garden log.",
      "Days 22–30: scout for pests, check watering depth, thin seedlings, mulch, photograph progress and record what you would change.",
      "At day 30, expand only if the first area is easy to maintain."
    ],
    methods: ["One-bed challenge", "Four-container challenge", "Kitchen-door herb garden", "Small greenhouse bench"],
    caution: "Planting dates must match the actual month and weather; the Learn calendar should be consulted before following a generic starter plan.",
    sourceKeys: ["UT_VEG", "UT_FRUIT_CAL"]
  },
  {
    slug: "year-round-calendar",
    title: "A year-round learning loop",
    level: "All levels",
    environment: "All",
    local: "Zone 7a/7b",
    summary: "Winter planning, spring establishment, summer management and fall soil-building form one continuous system.",
    steps: [
      "Winter: review records, order seed, prune appropriate woody plants, maintain tools, start selected transplants.",
      "Early spring: soil test, cool-season planting, irrigation repair, mulch and first pest scouting.",
      "Late spring/summer: warm-season succession, trellising, irrigation, harvest, disease and insect monitoring.",
      "Late summer/fall: start fall vegetables before summer crops finish, plant cover crops, preserve harvests.",
      "Late fall: protect soil, clean diseased debris selectively, leave intentional beneficial-insect habitat and prepare protected structures."
    ],
    methods: ["Paper calendar", "Digital reminders", "Farm journal", "Phenology log"],
    caution: "Calendar dates are starting points. Temperature, rainfall, elevation and microclimate should override a rigid date.",
    sourceKeys: ["UT_FRUIT_CAL", "UT_HOME"]
  }
];

export const PERMACULTURE_SEARCH_TERMS = [
  "permaculture", "soil", "compost", "mulch", "swale", "rain garden", "water",
  "raised bed", "no dig", "till", "pollinator", "row cover", "greenhouse",
  "grow tent", "indoor", "guild", "native", "hardy", "zone 7", "7a", "7b",
  "seed saving", "rotation", "succession", "accessible gardening"
];
