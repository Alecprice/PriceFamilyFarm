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
  "app/farm-records/page.js",
  "app/available/page.js",
  "app/funding/page.js",
  "app/weather/page.js",
  "components/FarmRecordWorkspace.jsx",
  "components/AvailabilityInterestForm.jsx",
  "components/FundingEducationTracker.jsx",
  "components/WeatherPanel.jsx",
  "lib/contactConfig.js",
];

for (const file of required) expect(fs.existsSync(path.join(root, file)), `required file exists: ${file}`);

const farmRecords = read("components/FarmRecordWorkspace.jsx");
expect(farmRecords.includes("localStorage"), "farm records persist locally");
expect(farmRecords.includes("Download JSON backup"), "farm records offer JSON backup");
expect(farmRecords.includes("Download CSV"), "farm records offer CSV export");
expect(!farmRecords.includes("fetch("), "private farm records do not transmit to a server");

const funding = read("components/FundingEducationTracker.jsx");
expect(funding.includes("official program link"), "funding tracker warns users to verify current rules");
expect(funding.includes("localStorage"), "funding tracker stays browser-local");

const availability = read("components/AvailabilityInterestForm.jsx");
expect(availability.includes("interest list, not a preorder"), "availability form does not imply inventory or preorder");
expect(availability.includes('name="botcheck"'), "availability form includes spam honeypot");

const contact = read("components/ContactForm.jsx");
expect(contact.includes('name="botcheck"'), "contact form includes spam honeypot");
expect(!contact.includes("alecjordanprice@gmail.com"), "contact source does not publish private inbox address");

const weather = read("components/WeatherPanel.jsx");
expect(weather.includes("Live conditions are temporarily unavailable"), "weather has an explicit unavailable fallback");
expect(weather.includes("No weather values are being guessed"), "weather fallback avoids fabricated data");

const nav = read("components/Nav.jsx");
for (const label of ["Farm", "Plan", "Learn", "Contact"]) expect(nav.includes(`label: "${label}"`), `task-oriented nav includes ${label}`);

const privatePages = [read("app/farm-records/page.js"), read("app/funding/page.js")];
expect(privatePages.every((source) => source.includes("index: false")), "browser-local operating pages are noindex");

if (failures.length) {
  console.error(`Farm OS verification failed (${failures.length}/${checks.length}):`);
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

console.log(`Farm OS verification passed: ${checks.length} checks.`);
