import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];

function expect(condition, label) {
  checks.push(label);
  if (!condition) failures.push(label);
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const required = [
  "app/farm-os/page.js",
  "app/farm-today/page.js",
  "app/farm-records/page.js",
  "app/farm-analytics/page.js",
  "app/farm-inventory/page.js",
  "app/plantings/page.js",
  "app/crop-profitability/page.js",
  "app/farm-data-health/page.js",
  "app/market-planner/page.js",
  "app/weekly-work-sheet/page.js",
  "app/farm-backup/page.js",
  "app/available/page.js",
  "app/funding/page.js",
  "app/weather/page.js",
  "components/FarmOsDashboard.jsx",
  "components/FarmRecordWorkspace.jsx",
  "components/FarmAnalyticsDashboard.jsx",
  "components/FarmInventory.jsx",
  "components/PlantingTracker.jsx",
  "components/CropProfitability.jsx",
  "components/FarmDataHealth.jsx",
  "components/FarmMarketPlanner.jsx",
  "components/WeeklyWorkSheet.jsx",
  "components/FarmOsExpansionPanel.jsx",
  "components/FarmLocalBackup.jsx",
  "components/AvailabilityInterestForm.jsx",
  "components/FundingEducationTracker.jsx",
  "components/WeatherPanel.jsx",
  "lib/contactConfig.js",
  "lib/farmStoreRegistry.js",
];

for (const file of required) expect(fs.existsSync(path.join(root, file)), `required file exists: ${file}`);

const farmRecords = read("components/FarmRecordWorkspace.jsx");
expect(farmRecords.includes("localStorage"), "farm records persist locally");
expect(farmRecords.includes("Download JSON backup"), "farm records offer JSON backup");
expect(farmRecords.includes("Download CSV"), "farm records offer CSV export");
expect(!farmRecords.includes("fetch("), "private farm records do not transmit to a server");

const analytics = read("components/FarmAnalyticsDashboard.jsx");
expect(analytics.includes("price-family-farm-records-v2"), "farm analytics reads the existing private records store");
expect(analytics.includes("localStorage"), "farm analytics stays browser-local");
expect(!analytics.includes("fetch("), "farm analytics does not transmit private records");
expect(analytics.includes("Recorded cash margin"), "farm analytics labels cash margin rather than accounting profit");

const inventory = read("components/FarmInventory.jsx");
expect(inventory.includes("price-family-farm-inventory-v1"), "farm inventory uses its approved browser-local store");
expect(inventory.includes("reorderAt"), "farm inventory supports reorder thresholds");
expect(!inventory.includes("fetch("), "farm inventory does not contact suppliers or a backend");

const plantings = read("components/PlantingTracker.jsx");
expect(plantings.includes("price-family-farm-plantings-v1"), "planting tracker uses its approved browser-local store");
expect(plantings.includes("nextSuccessionDate"), "planting tracker supports succession scheduling");
expect(plantings.includes("price-family-farm-garden-layout-v1"), "plantings can reference the local garden layout");
expect(!plantings.includes("fetch("), "planting tracker does not transmit production data");

const profitability = read("components/CropProfitability.jsx");
expect(profitability.includes("Recorded crop economics, not accounting profit"), "crop economics disclaims incomplete accounting profit");
expect(profitability.includes("marginPerSqFt"), "crop economics supports recorded per-square-foot margin where mapped area exists");
expect(!profitability.includes("fetch("), "crop economics stays browser-local");

const market = read("components/FarmMarketPlanner.jsx");
expect(market.includes("price-family-farm-market-plan-v1"), "market planner uses its approved browser-local store");
expect(market.includes("not automatically available stock"), "market planner does not treat harvest signals as confirmed inventory");
expect(market.includes("Aggregate interest count"), "market planner stores aggregate demand signals rather than customer identities");
expect(!market.includes("fetch("), "market planner does not transmit private market planning data");

const dataHealth = read("components/FarmDataHealth.jsx");
expect(dataHealth.includes("price-family-farm-pre-repair-snapshot-v1"), "data health keeps a pre-repair recovery snapshot");
expect(dataHealth.includes("price-family-farm-market-plan-v1"), "data health covers the market planner store");
expect(dataHealth.includes("pff.growingJourney.v1"), "data health covers the Growing Journey store");
expect(dataHealth.includes("pff.growingJourney.backups.v1"), "data health covers Growing Journey recovery snapshots");
expect(dataHealth.includes("confirmation !== \"REPAIR\""), "data health requires typed repair confirmation");
expect(!dataHealth.includes("fetch("), "data health never uploads private stores");

const backup = read("components/FarmLocalBackup.jsx");
const storeRegistry = read("lib/farmStoreRegistry.js");
for (const key of [
  "price-family-farm-inventory-v1",
  "price-family-farm-plantings-v1",
  "price-family-farm-market-plan-v1",
  "pff.growingJourney.v1",
  "pff.growingJourney.backups.v1",
]) {
  expect(storeRegistry.includes(key), `Farm OS shared backup/sync allowlist includes ${key}`);
}
expect(
  backup.includes('from "@/lib/farmStoreRegistry"'),
  "Farm OS backup imports the canonical shared backup/sync allowlist"
);
expect(
  backup.includes("FARM_STORES"),
  "Farm OS backup enumerates the canonical shared store registry"
);
expect(
  backup.includes("validFarmStoreValue"),
  "Farm OS backup uses canonical shared store validation"
);
expect(backup.includes("price-family-farm-pre-restore-snapshot-v1"), "Farm OS backup captures a pre-restore snapshot");

const osDashboard = read("components/FarmOsDashboard.jsx");
expect(osDashboard.includes('from "@/lib/farmStoreRegistry"'), "Farm OS dashboard imports the canonical shared store registry");
expect(osDashboard.includes("FARM_STORES"), "Farm OS dashboard counts every canonical Farm OS store");
expect(osDashboard.includes("readValidFarmStore"), "Farm OS dashboard reuses canonical store validation");
expect(!osDashboard.includes("const STORES ="), "Farm OS dashboard does not duplicate local-storage key and size definitions");
expect(osDashboard.includes("detectedStoreCount"), "Farm OS dashboard reports the complete detected canonical store count");

const osExpansion = read("components/FarmOsExpansionPanel.jsx");
expect(osExpansion.includes('from "@/lib/farmStoreRegistry"'), "Farm OS expansion panel imports the canonical shared store registry");
expect(osExpansion.includes("FARM_STORE_BY_ID"), "Farm OS expansion panel resolves inventory, planting, and market stores canonically");
expect(osExpansion.includes("readValidFarmStore"), "Farm OS expansion panel reuses canonical store validation");
expect(!osExpansion.includes("const STORES ="), "Farm OS expansion panel does not duplicate storage keys or byte limits");

const privacy = read("components/PrivacyTools.jsx");
expect(privacy.includes("pff.growingJourney.v1"), "privacy tools expose Growing Journey local data");
expect(privacy.includes("pff.growingJourney.backups.v1"), "privacy tools expose Growing Journey recovery snapshots");

const journeyStorage = read("lib/planner/plannerStorage.js");
expect(journeyStorage.includes("MAX_PLAN_BYTES"), "Growing Journey enforces a plan-size boundary");
expect(journeyStorage.includes("MAX_BACKUP_BYTES"), "Growing Journey enforces a recovery-snapshot boundary");
expect(journeyStorage.includes("export function isValidPlanShape"), "Growing Journey exposes canonical deep plan validation");
expect(journeyStorage.includes("isValidCropRecord"), "Growing Journey validates imported crop records");
expect(journeyStorage.includes("isValidTaskRecord"), "Growing Journey validates imported custom tasks");
expect(journeyStorage.includes("raw.length>MAX_PLAN_BYTES") || journeyStorage.includes("raw.length > MAX_PLAN_BYTES"), "Growing Journey rejects oversized stored plans before parsing");
expect(
  storeRegistry.includes("isValidPlanShape") &&
    storeRegistry.includes("isValidBackupCollection"),
  "Farm OS shared registry reuses canonical Growing Journey validation"
);
expect(dataHealth.includes("isValidPlanShape"), "Data Health reuses canonical Growing Journey validation");

const funding = read("components/FundingEducationTracker.jsx");
expect(funding.includes("official program link"), "funding tracker warns users to verify current rules");
expect(funding.includes("localStorage"), "funding tracker stays browser-local");

const availability = read("components/AvailabilityInterestForm.jsx");
expect(availability.includes("interest list, not a preorder"), "availability form does not imply inventory or preorder");
expect(availability.includes('name="botcheck"'), "availability form includes spam honeypot");

const contact = read("components/ContactForm.jsx");
expect(contact.includes('name="botcheck"'), "contact form includes spam honeypot");
expect(!contact.includes("alecjordanprice@gmail.com"), "contact source does not publish private inbox address");

const yearRoundCalendar = read("components/planner/YearRoundCalendar.jsx");
expect(yearRoundCalendar.includes('role="tablist"'), "year-round calendar exposes an ARIA tablist");
expect(yearRoundCalendar.includes("ArrowRight"), "year-round calendar supports ArrowRight tab navigation");
expect(yearRoundCalendar.includes("ArrowLeft"), "year-round calendar supports ArrowLeft tab navigation");
expect(yearRoundCalendar.includes("'Home'"), "year-round calendar supports Home tab navigation");
expect(yearRoundCalendar.includes("'End'"), "year-round calendar supports End tab navigation");

const weather = read("components/WeatherPanel.jsx");
expect(weather.includes("Live conditions are temporarily unavailable"), "weather has an explicit unavailable fallback");
expect(weather.includes("No weather values are being guessed"), "weather fallback avoids fabricated data");

const nav = read("components/Nav.jsx");
for (const label of ["Farm", "Plan", "Learn", "Contact"]) expect(nav.includes(`label: "${label}"`), `task-oriented nav includes ${label}`);
for (const label of ["What We Grow", "2026 Season Tracker", "Experiment Log", "Farm Journal", "Season Timeline", "Availability", "Farm OS", "Farm Planner", "Farm Calendar", "Farm Map", "Growing Guide", "Growing Conditions"]) {
  expect(nav.includes(`label: "${label}"`), `public navigation exposes ${label}`);
}
for (const label of ["Farm Analytics", "Crop Profitability", "Farm Inventory", "Farm OS Data Health", "Plantings & Successions", "Market Planner", "Weekly Work Sheet", "Farm Records", "Funding & Education"]) {
  expect(!nav.includes(`label: "${label}"`), `public navigation keeps ${label} behind the Farm OS doorway`);
}
for (const href of ["/farm-records", "/farm-analytics", "/farm-inventory", "/farm-os/planner", "/farm-os/calendar", "/farm-os/timeline", "/farm-os/journal", "/farm-os/map", "/funding"]) {
  expect(osDashboard.includes(`href="${href}"`), `Farm OS dashboard retains private access to ${href}`);
}
for (const href of ["/plantings", "/market-planner", "/crop-profitability", "/weekly-work-sheet", "/farm-data-health", "/farm-backup"]) {
  expect(osExpansion.includes(`href="${href}"`), `Farm OS expansion retains private access to ${href}`);
}

const privatePageFiles = [
  "app/farm-os/page.js",
  "app/farm-os/cloud-sync/page.js",
  "app/farm-os/experiments/page.js",
  "app/farm-os/harvest/page.js",
  "app/farm-os/journal/page.js",
  "app/farm-os/timeline/page.js",
  "app/farm-os/calendar/page.js",
  "app/farm-os/map/page.js",
  "app/farm-os/planner/page.js",
  "app/farm-today/page.js",
  "app/farm-weekly-review/page.js",
  "app/weekly-work-sheet/page.js",
  "app/farm-records/page.js",
  "app/farm-analytics/page.js",
  "app/crop-profitability/page.js",
  "app/farm-inventory/page.js",
  "app/farm-data-health/page.js",
  "app/plantings/page.js",
  "app/market-planner/page.js",
  "app/learn/garden-layout-builder/page.js",
  "app/funding/page.js",
  "app/privacy-tools/page.js",
  "app/farm-backup/page.js",
  "app/my-growing-journey/page.js",
];
for (const file of privatePageFiles) {
  expect(read(file).includes("index: false"), `browser-local page is noindex: ${file}`);
}

const robots = read("app/robots.js");
for (const route of [
  "/farm-os",
  "/farm-today",
  "/farm-weekly-review",
  "/weekly-work-sheet",
  "/farm-records",
  "/farm-analytics",
  "/crop-profitability",
  "/farm-inventory",
  "/farm-data-health",
  "/plantings",
  "/market-planner",
  "/learn/garden-layout-builder",
  "/funding",
  "/privacy-tools",
  "/farm-backup",
  "/my-growing-journey",
]) {
  expect(robots.includes(`"${route}"`), `robots disallows browser-local route ${route}`);
}

if (failures.length) {
  console.error(`Farm OS verification failed (${failures.length}/${checks.length}):`);
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

console.log(`Farm OS verification passed: ${checks.length} checks.`);
