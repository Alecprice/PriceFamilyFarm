import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];
const SKIP_DIRS = new Set([".git", ".next", "node_modules", "out", "coverage", "test-results", "playwright-report"]);
const TEXT_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml", ".txt", ".html", ".css"]);

function expect(condition, label) {
  checks.push(label);
  if (!condition) failures.push(label);
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function walk(directory, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".github" && entry.name !== ".well-known") continue;
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name)) || entry.name === "security.txt") output.push(full);
  }
  return output;
}

const files = walk(root);
const combined = files.map((file) => `\n/* FILE:${path.relative(root, file)} */\n${fs.readFileSync(file, "utf8")}`).join("\n");

const secretPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key material is not committed"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key IDs are not committed"],
  [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/, "GitHub tokens are not committed"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, "Slack tokens are not committed"],
  [/\bsk_live_[A-Za-z0-9]{20,}\b/, "Stripe live secret keys are not committed"],
];

for (const [pattern, label] of secretPatterns) expect(!pattern.test(combined), label);
expect(!/\bjavascript\s*:/i.test(combined), "javascript: URLs are absent");
expect(!/\beval\s*\(/.test(combined), "eval() is absent");
expect(!/\bnew\s+Function\s*\(/.test(combined), "new Function() is absent");
expect(!/document\.write\s*\(/.test(combined), "document.write() is absent");

const contactConfig = read("lib/contactConfig.js");
expect(contactConfig.includes("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY"), "contact key is injected at build time");
expect(!/["'][0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}["']/i.test(contactConfig), "contact key is not hardcoded in source");

const farmRecords = read("components/FarmRecordWorkspace.jsx");
expect(farmRecords.includes("MAX_BACKUP_BYTES"), "farm backup import has a size limit");
expect(farmRecords.includes("sanitizeRecords"), "farm backup import is schema-sanitized");
expect(farmRecords.includes("[=+\\-@]"), "CSV export neutralizes spreadsheet formulas");

const funding = read("components/FundingEducationTracker.jsx");
expect(funding.includes("safeHttpsUrl"), "funding links are protocol-validated");
expect(funding.includes('url.protocol === "https:"'), "funding links require HTTPS");

const weather = read("components/WeatherPanel.jsx");
expect(weather.includes('url.hostname !== "api.weather.gov"'), "NWS forecast redirect origin is allowlisted");
expect(weather.includes("REQUEST_TIMEOUT_MS"), "NWS requests have a timeout");

for (const file of files.filter((file) => /\.(jsx?|mjs)$/.test(file))) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  for (const match of source.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)) {
    expect(/rel=["'][^"']*(?:noopener|noreferrer)[^"']*["']/.test(match[0]), `${relative} protects target=_blank links`);
  }
  for (const match of source.matchAll(/http:\/\/[^\s"'`)]+/g)) {
    expect(/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/.test(match[0]), `${relative} has no insecure external HTTP URLs`);
  }
}

expect(!fs.existsSync(path.join(root, ".env")), ".env is not committed");
expect(!fs.existsSync(path.join(root, ".env.local")), ".env.local is not committed");

if (failures.length) {
  console.error(`Security verification failed (${failures.length}/${checks.length}):`);
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

console.log(`Security verification passed: ${checks.length} checks.`);
