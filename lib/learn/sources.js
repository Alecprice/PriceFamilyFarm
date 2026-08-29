export const LEARN_SOURCES = {
  UT_SITE: {
    name: "UT Extension — The Tennessee Vegetable Garden: Site Selection and Soil Testing (W 346-A)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/W346-A.pdf",
    note: "Tennessee-specific guidance on sunlight, drainage, slope, previous site activity, access, water and soil testing."
  },
  UT_LEAFY: {
    name: "UT Extension — Leafy Crops for the Tennessee Vegetable Garden (D 68)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/D68.pdf",
    note: "Tennessee planting windows and spacing examples showing how density changes for mature versus baby-leaf harvest."
  },
  NCSU_VEG: {
    name: "NC State Extension — Vegetable Gardening, Extension Gardener Handbook",
    url: "https://content.ces.ncsu.edu/extension-gardener-handbook/16-vegetable-gardening",
    note: "Research-based intensive-garden spacing, bed design, succession planting and interplanting."
  },
  NCSU_BROCCOLI: {
    name: "NC State Extension — Basics of Broccoli Production",
    url: "https://content.ces.ncsu.edu/basics-of-broccoli-production",
    note: "Demonstrates how broccoli density is adjusted for small bunching heads versus larger single heads."
  },
  UT_HOME: {
    name: "UT Extension — Welcome Home: Gardening in Tennessee (PB 1919)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/PB1919.pdf",
    note: "Tennessee climate, soils, hardiness zones and foundational home-garden guidance."
  },
  UT_VEG: {
    name: "UT Extension — Growing Vegetables in Home Gardens (PB 901)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/PB901.pdf",
    note: "Tennessee vegetable planting, seed, transplant and crop-management guidance."
  },
  UT_MGMT: {
    name: "UT Extension — Tennessee Vegetable Garden: Plant Management Practices (W 346-D)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/W346-D.pdf",
    note: "Water, weeds, soils and garden plant-management practices."
  },
  UT_INSECTS: {
    name: "UT Extension — You Can Control Garden Insects (PB 595)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/PB595.pdf",
    note: "Tennessee vegetable pests, beneficials, scouting and integrated control."
  },
  UT_DISEASE: {
    name: "UT Extension — Home Vegetable Garden Disease Control (W 316)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/W316.pdf",
    note: "Tennessee home-vegetable disease recognition, sanitation and management."
  },
  UT_LANDSCAPE: {
    name: "UT Extension — Plants for Tennessee Landscapes: Perennials (W 874-B)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/W874-B.pdf",
    note: "Hardiness, site selection and Tennessee-adapted perennial landscape plants."
  },
  UT_FRUIT_CAL: {
    name: "UT Extension — Tennessee Home Fruit and Vegetable Garden Calendar (W 436)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2024/02/W436.pdf",
    note: "Month-by-month Tennessee fruit, vegetable and herb gardening tasks."
  },
  UT_FRUIT_PEST: {
    name: "UT Extension — Disease and Insect Control in Home Fruit Plantings (PB 1622)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/PB1622.pdf",
    note: "Tennessee home-fruit IPM, sanitation, resistant cultivars and disease/insect management."
  },
  UT_GRAPE_ROT: {
    name: "UT Extension — Plant Diseases: Black Rot of Grape (SP 277-J)",
    url: "https://utia.tennessee.edu/publications/wp-content/uploads/sites/269/2023/10/SP277-J.pdf",
    note: "Tennessee grape black-rot symptoms and management."
  },
  NCSU_IPM: {
    name: "NC State Extension — Integrated Pest Management, Extension Gardener Handbook",
    url: "https://content.ces.ncsu.edu/extension-gardener-handbook/8-integrated-pest-management-ipm",
    note: "IPM decision-making, row covers, mechanical, cultural and biological controls."
  },
  NCSU_DIAG: {
    name: "NC State Extension — Diagnostics, Extension Gardener Handbook",
    url: "https://content.ces.ncsu.edu/extension-gardener-handbook/7-diagnostics",
    note: "A systematic approach to diagnosing plant problems."
  },
  NCSU_DISEASE: {
    name: "NC State Extension — Diseases and Disorders, Extension Gardener Handbook",
    url: "https://content.ces.ncsu.edu/extension-gardener-handbook/5-diseases-and-disorders",
    note: "Plant disease, abiotic disorder and management fundamentals."
  },
  NCSU_PATH: {
    name: "NC State Extension — Vegetable Pathology Factsheets",
    url: "https://content.ces.ncsu.edu/catalog/series/116/vegetable-pathology-factsheets",
    note: "Crop-specific disease references including field and protected-culture vegetables."
  },
  PSU_BENEFICIALS: {
    name: "Penn State Extension — Let Beneficial Insects Work for You",
    url: "https://extension.psu.edu/let-beneficial-insects-work-for-you",
    note: "Beneficial predators, parasitoids and conservation practices."
  },
  PSU_POLLINATORS: {
    name: "Penn State Extension — Pollinator Habitat and Landscape",
    url: "https://extension.psu.edu/insects-pests-and-diseases/pollinators/habitat-and-landscape",
    note: "Pollinator diversity, food, water, shelter and landscape support."
  },
  TNIPC: {
    name: "Tennessee Invasive Plant Council — Invasive Plants",
    url: "https://www.tnipc.org/invasive-plants/",
    note: "Current Tennessee invasive-plant lists and avoidance guidance."
  }
};

export function sourcesFor(keys = []) {
  return keys.map((key) => ({ key, ...LEARN_SOURCES[key] })).filter((item) => item.url);
}
