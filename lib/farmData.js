export const FARM_PROFILE = {
  name: "Price Family Farm",
  location: "Greeneville, East Tennessee",
  county: "Greene County, Tennessee",
  established: 2026,
  growingZone: "7a",
  greenhouse: "10×12 greenhouse",
  blueberryCount: "23+",
};

export const FARM_AREAS = [
  {
    id: "orchard",
    label: "Orchard & Perennials",
    short: "Orchard",
    description: "Fruit trees, vines, berries, and long-lived perennial crops established beginning in 2026.",
    crops: ["Apples", "Pears", "Peaches", "Pawpaws", "Plums", "Cherries", "Figs", "Grapes", "Blueberries", "Elderberries", "Pomegranates"],
  },
  {
    id: "greenhouse",
    label: "Greenhouse",
    short: "Greenhouse",
    description: "A 10×12 protected growing space used to extend the season, raise starts, and keep propagation moving.",
    crops: ["Vegetable starts", "Herbs", "Propagation trays", "Seasonal starts"],
  },
  {
    id: "raised-beds",
    label: "Raised Beds",
    short: "Raised beds",
    description: "Intensive seasonal production in improved growing media above East Tennessee clay.",
    crops: ["Greens", "Herbs", "Vegetables", "Seasonal rotations"],
  },
  {
    id: "containers",
    label: "Container Rows",
    short: "Containers",
    description: "3-, 5-, 7-, 10-, 15-, 20-, and 25-gallon containers let the farm match soil volume to each crop and move plants as conditions change.",
    crops: ["Tomatoes", "Peppers", "Cucumbers", "Squash", "Zucchini", "Okra", "Melons"],
  },
  {
    id: "indoor",
    label: "Indoor Propagation",
    short: "Grow tents",
    description: "Two climate-controlled indoor grow tents support seed starting and young plants before they move outside.",
    crops: ["Seedlings", "Cuttings", "Young starts"],
  },
];

export const FARM_CROPS = [
  { slug: "apples", name: "Apples", category: "Tree fruit", area: "Orchard", status: "Establishing", established: "Spring 2026", details: ["Part of the expanding orchard", "Variety and rootstock records can be added tree-by-tree as the orchard matures"], season: "Dormant-season planting; harvest timing depends on variety" },
  { slug: "pears", name: "Pears", category: "Tree fruit", area: "Orchard", status: "Establishing", established: "Spring 2026", details: ["Part of the expanding orchard", "Individual cultivar records are not yet published"], season: "Dormant-season planting; harvest timing depends on variety" },
  { slug: "peaches", name: "Peaches", category: "Stone fruit", area: "Orchard", status: "Establishing", established: "Spring 2026", details: ["Young orchard planting", "Pruning, bloom, and harvest observations will be added to the farm journal"], season: "Dormant-season planting; summer harvest once trees are producing" },
  { slug: "pawpaws", name: "Pawpaws", category: "Native fruit", area: "Orchard", status: "Establishing", established: "Spring 2026", details: ["Included in the perennial fruit planting", "Long-term growth and fruiting notes will be recorded here"], season: "Dormant-season planting; late-summer/fall fruit when mature" },
  { slug: "plums", name: "Plums", category: "Stone fruit", area: "Orchard", status: "Establishing", established: "Spring 2026", details: ["6+ varieties represented", "The site will track each variety separately as records are added"], season: "Dormant-season planting; summer harvest once established" },
  { slug: "cherries", name: "Cherries", category: "Stone fruit", area: "Orchard", status: "Establishing", established: "Spring 2026", details: ["4 varieties represented", "Bloom and disease-pressure notes will be useful year-over-year records"], season: "Dormant-season planting; late-spring/early-summer harvest once established" },
  { slug: "figs", name: "Figs", category: "Uncommon fruit", area: "Orchard / containers", status: "Growing", established: "2026", details: ["Tracked as part of the farm's uncommon-fruit collection", "Winter protection and dieback observations can be recorded by season"], season: "Warm-season growth; harvest timing varies by cultivar and winter survival" },
  { slug: "grapes", name: "Grapes", category: "Vine fruit", area: "Orchard", status: "Establishing", established: "2026", details: ["Perennial vine crop", "Training, pruning, and fruiting records will be added as vines mature"], season: "Dormant-season planting; summer/fall harvest once mature" },
  { slug: "blueberries", name: "Blueberries", category: "Berries", area: "Orchard / berry area", status: "Established", established: "2026 farm season", details: ["23+ mature blueberry plants", "A major perennial planting for the farm"], season: "Dormant-season planting; early-to-midsummer harvest depending on cultivar" },
  { slug: "elderberries", name: "Elderberries", category: "Berries", area: "Orchard / berry area", status: "Growing", established: "2026", details: ["4 varieties represented", "Useful for tracking propagation, bloom, and berry set"], season: "Dormant-season planting; summer fruiting depending on cultivar" },
  { slug: "pomegranates", name: "Pomegranates", category: "Uncommon fruit", area: "Protected/perennial area", status: "Growing", established: "2026", details: ["2 varieties represented", "Cold-hardiness performance is worth documenting in Zone 7a"], season: "Warm-season growth; fruiting depends on variety and winter conditions" },
  { slug: "tomatoes", name: "Tomatoes", category: "Vegetables", area: "Containers / raised beds", status: "In seasonal rotation", established: "2026 growing season", details: ["Raised from seed indoors before transplanting", "Container moisture consistency is a major management point"], season: "Start indoors in late winter; transplant after frost danger" },
  { slug: "peppers", name: "Peppers", category: "Vegetables", area: "Containers / raised beds", status: "In seasonal rotation", established: "2026 growing season", details: ["Slow-starting warm-season crop", "Moved outside after soil and nighttime temperatures warm"], season: "Start indoors early; transplant in late spring" },
  { slug: "cucumbers", name: "Cucumbers", category: "Vegetables", area: "Containers / raised beds", status: "In seasonal rotation", established: "2026 growing season", details: ["Warm-season vine crop", "Direct sowing or transplanting after frost works in the local calendar"], season: "Late spring through summer" },
  { slug: "squash-zucchini", name: "Squash & Zucchini", category: "Vegetables", area: "Containers / raised beds", status: "In seasonal rotation", established: "2026 growing season", details: ["Warm-season production", "Squash bug pressure is one of the local challenges tracked in the growing guide"], season: "Late spring through summer" },
  { slug: "okra", name: "Okra", category: "Vegetables", area: "Containers / raised beds", status: "In seasonal rotation", established: "2026 growing season", details: ["Heat-loving summer crop", "Best started once soils are thoroughly warm"], season: "Late spring through hot summer weather" },
  { slug: "melons", name: "Melons", category: "Vegetables", area: "Containers / growing rows", status: "In seasonal rotation", established: "2026 growing season", details: ["Warm-season crop requiring consistent moisture", "Plant after frost once soil is warm"], season: "Late spring through summer" },
  { slug: "herbs-greens", name: "Herbs & Greens", category: "Herbs and greens", area: "Greenhouse / raised beds / containers", status: "In seasonal rotation", established: "2026 growing season", details: ["A mix of culinary herbs plus salad and cooking greens", "Cool-season and warm-season varieties rotate through the year"], season: "Multiple planting windows from early spring through fall" },
];

export const JOURNAL_ENTRIES = [
  {
    slug: "first-orchard-trees",
    sortDate: "2026-02-01",
    displayDate: "February 2026",
    category: "Orchard",
    title: "The first orchard trees go in",
    summary: "The first fruit trees were planted, marking the practical beginning of the orchard and the farm's first growing season.",
    details: ["Tree fruit and perennial plantings began building the long-term side of the farm.", "The orchard will be tracked here by season as bloom, pruning, grafting, survival, and harvest records accumulate."],
    links: [{ href: "/what-we-grow", label: "See the orchard crops" }],
  },
  {
    slug: "building-growing-space",
    sortDate: "2026-03-01",
    displayDate: "Spring 2026",
    category: "Infrastructure",
    title: "Building the growing space",
    summary: "Raised beds, containers, seed-starting supplies, and protected growing space turned a home lot into a working production system.",
    details: ["Containers now span 3, 5, 7, 10, 15, 20, and 25 gallons.", "A 10×12 greenhouse and two climate-controlled indoor grow tents extend the production and propagation season."],
    links: [{ href: "/how-we-grow", label: "See how the farm grows" }, { href: "/farm-map", label: "Explore the farm system" }],
  },
  {
    slug: "farm-name-registered",
    sortDate: "2026-06-16",
    displayDate: "June 16, 2026",
    category: "Milestone",
    title: "Price Family Farm becomes the official registered farm name",
    summary: "The Tennessee Department of Agriculture registered PRICE FAMILY FARM as the official family farm name for use in Greene County, Tennessee.",
    details: ["The original registration certificate is preserved in the site's documentation archive."],
    links: [{ href: "/documentation#official-records", label: "View the registration" }],
  },
  {
    slug: "master-farm-manager",
    sortDate: "2026-07-31",
    displayDate: "July 31, 2026",
    category: "Education",
    title: "Master Farm Manager Program completed",
    summary: "Alec Price completed the University of Tennessee Institute of Agriculture's Master Farm Manager Program.",
    details: ["The completion certificate is preserved alongside the farm registration in the documentation archive."],
    links: [{ href: "/documentation#official-records", label: "View the certificate" }],
  },
  {
    slug: "first-full-season",
    sortDate: "2026-08-01",
    displayDate: "August 2026",
    category: "Season",
    title: "The first full growing season is in motion",
    summary: "Orchard crops, berries, vegetables, herbs, greenhouse propagation, and container production are all part of the farm's first full season.",
    details: ["This journal is now the central place to record what succeeds, what fails, what changes, and what gets harvested.", "Future entries can be tied directly to crop pages, experiments, harvest totals, and farm areas."],
    links: [{ href: "/harvest", label: "Open the 2026 season tracker" }],
  },
];

export const MILESTONES = [
  { date: "Feb 2026", title: "First trees planted", body: "The orchard begins with the first fruit trees in the ground." },
  { date: "Spring 2026", title: "Growing infrastructure built out", body: "Raised beds, containers, seed-starting equipment, greenhouse space, and indoor grow tents establish the production system." },
  { date: "Jun 16, 2026", title: "Farm name registered", body: "PRICE FAMILY FARM is registered with the Tennessee Department of Agriculture for Greene County." },
  { date: "Jul 31, 2026", title: "Master Farm Manager completed", body: "Alec Price completes the University of Tennessee Institute of Agriculture's Master Farm Manager Program." },
  { date: "Aug 2026", title: "First full season documented", body: "The website becomes a living record for crops, experiments, harvests, infrastructure, and farm history." },
];

export const CURRENT_STATUS = [
  { label: "Orchard", value: "Establishing", note: "Fruit trees, vines, and berries are building toward future production." },
  { label: "Growing systems", value: "In place", note: "Greenhouse, raised beds, containers, and indoor grow spaces form the first-season production system." },
  { label: "Plant starts", value: "Seasonal", note: "Seed starting and propagation move through the greenhouse and indoor spaces as each planting window arrives." },
  { label: "Recordkeeping", value: "2026 baseline", note: "The first season is the baseline for future crop, harvest, and experiment comparisons." },
];

export const AVAILABILITY = [
  { item: "Vegetable, herb & flower starts", status: "Seasonal", note: "Availability changes through the planting season. Contact the farm for the current list." },
  { item: "Berry & fruiting-plant starts", status: "Limited / seasonal", note: "Select blackberry, raspberry, boysenberry, and other propagated fruiting plants may be offered as they are ready." },
  { item: "Farm-grown produce", status: "Seasonal", note: "Produce availability follows the harvest. Current quantities are confirmed directly before pickup." },
  { item: "Orchard fruit", status: "Orchard establishing", note: "Most tree-fruit plantings are young and are being documented as they mature into production." },
];

export const HARVEST_STATS = [
  { label: "Blueberry plants", value: "23+", state: "known" },
  { label: "Plum varieties", value: "6+", state: "known" },
  { label: "Cherry varieties", value: "4", state: "known" },
  { label: "Elderberry varieties", value: "4", state: "known" },
  { label: "Pomegranate varieties", value: "2", state: "known" },
  { label: "Harvest weight", value: "Start tracking", state: "open" },
  { label: "Plants started", value: "Start tracking", state: "open" },
  { label: "Preserved / canned", value: "Start tracking", state: "open" },
];

export const EXPERIMENTS = [
  { id: "container-size", status: "Ready to record", title: "Container size vs. tomato yield", question: "How much difference do larger containers make in plant health, watering frequency, and total yield?", measures: ["Container size", "Variety", "Watering frequency", "Harvest weight", "Fruit count"] },
  { id: "grafting", status: "Ready to record", title: "Grafting success by method", question: "Which grafting method, timing, and scion/rootstock combinations perform best under the farm's conditions?", measures: ["Method", "Date", "Scion", "Rootstock", "Take / failure", "Growth after 30/60/90 days"] },
  { id: "greenhouse-temp", status: "Ready to record", title: "Greenhouse temperature swings", question: "How quickly does the 10×12 greenhouse warm and cool compared with outdoor conditions?", measures: ["Outdoor temperature", "Greenhouse temperature", "Time", "Ventilation state", "Plant response"] },
  { id: "potting-mix", status: "Ready to record", title: "Growing-mix comparison", question: "Which container mix holds moisture well without staying too wet in humid East Tennessee weather?", measures: ["Mix recipe", "Crop", "Watering interval", "Growth", "Root condition"] },
  { id: "overwintering", status: "Ready to record", title: "Overwintering tender perennials", question: "Which protection methods give figs, pomegranates, and other marginal plants the best spring recovery?", measures: ["Plant", "Protection method", "Minimum temperature", "Dieback", "Spring regrowth"] },
];

export const MONTHLY_FARM_CALENDAR = [
  { month: "January", tasks: ["Review last season's records", "Plan seed orders and varieties", "Inspect stored supplies and propagation equipment"] },
  { month: "February", tasks: ["Plant dormant bare-root trees and berries when conditions allow", "Start peppers indoors", "Start tomatoes indoors later in the month"] },
  { month: "March", tasks: ["Direct sow hardy spring greens", "Pot up seedlings", "Prepare containers and raised beds"] },
  { month: "April", tasks: ["Harden off warm-season starts", "Watch frost forecasts closely", "Transplant tomatoes only after frost risk has passed"] },
  { month: "May", tasks: ["Set peppers, basil, cucumbers, squash, and melons outside", "Begin warm-season watering rhythm", "Stake crops before they get large"] },
  { month: "June", tasks: ["Mulch for moisture control", "Scout for beetles, squash bugs, and fungal pressure", "Record first major harvests as they happen"] },
  { month: "July", tasks: ["Keep irrigation consistent through heat", "Harvest frequently", "Start planning fall greens"] },
  { month: "August", tasks: ["Direct sow fall kale/collards and other cool-season crops", "Record summer yields and problem spots", "Begin seed-saving notes where appropriate"] },
  { month: "September", tasks: ["Transition beds toward fall crops", "Continue orchard and perennial observations", "Plan fall cleanup and compost inputs"] },
  { month: "October", tasks: ["Plant garlic", "Protect tender crops from first frost", "Move appropriate plants toward overwintering spaces"] },
  { month: "November", tasks: ["Clean and store stakes, trays, and tools", "Add finished plant material to compost when appropriate", "Review orchard protection for winter"] },
  { month: "December", tasks: ["Summarize the season", "Compare experiments", "Set next year's crop and infrastructure priorities"] },
];
