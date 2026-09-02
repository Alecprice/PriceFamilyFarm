import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];
const SKIP_DIRS = new Set([".git", ".next", "node_modules", "out", "coverage", "test-results", "playwright-report"]);
const TEXT_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml", ".txt", ".html", ".css"]);
const NON_NETWORK_HTTP_IDENTIFIERS = new Set([
  "http://www.w3.org/2000/svg",
  "http://www.w3.org/1999/xlink",
]);

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
const allText = files.map((file) => `\n/* FILE:${path.relative(root, file)} */\n${fs.readFileSync(file, "utf8")}`).join("\n");
const runtimeFiles = files.filter((file) => {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  return !relative.startsWith("tests/") && !relative.startsWith("scripts/") && !relative.startsWith("docs/") && !relative.startsWith(".github/") && !relative.startsWith("deploy/");
});
const runtimeText = runtimeFiles.map((file) => `\n/* FILE:${path.relative(root, file)} */\n${fs.readFileSync(file, "utf8")}`).join("\n");

const secretPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key material is not committed"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key IDs are not committed"],
  [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/, "GitHub tokens are not committed"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, "Slack tokens are not committed"],
  [/\bsk_live_[A-Za-z0-9]{20,}\b/, "Stripe live secret keys are not committed"],
];

for (const [pattern, label] of secretPatterns) expect(!pattern.test(allText), label);
expect(!/\bjavascript\s*:/i.test(runtimeText), "javascript: URLs are absent from runtime source");
expect(!/\beval\s*\(/.test(runtimeText), "eval() is absent from runtime source");
expect(!/\bnew\s+Function\s*\(/.test(runtimeText), "new Function() is absent from runtime source");
expect(!/document\.write\s*\(/.test(runtimeText), "document.write() is absent from runtime source");

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

const qualityWorkflow = read(".github/workflows/quality.yml");
const codeqlWorkflow = read(".github/workflows/codeql.yml");
const checkoutNode24Pin = "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1";
expect(qualityWorkflow.includes(checkoutNode24Pin), "quality workflow pins checkout v7.0.1 on the Node 24 action runtime");
expect(codeqlWorkflow.includes(checkoutNode24Pin), "CodeQL workflow pins checkout v7.0.1 on the Node 24 action runtime");
expect(qualityWorkflow.includes("actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0"), "quality workflow pins setup-node v7.0.0 on the Node 24 action runtime");
expect(qualityWorkflow.includes("actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1"), "quality workflow pins upload-artifact v7.0.1 on the Node 24 action runtime");
expect(!qualityWorkflow.includes("@11d5960a326750d5838078e36cf38b85af677262"), "quality workflow no longer pins the deprecated checkout v4 runtime");
expect(!qualityWorkflow.includes("@49933ea5288caeca8642d1e84afbd3f7d6820020"), "quality workflow no longer pins the deprecated setup-node v4 runtime");

const edgePolicy = JSON.parse(read("deploy/cloudfront-security-headers-policy.json"));
const securityHeaders = edgePolicy.SecurityHeadersConfig || {};
const csp = securityHeaders.ContentSecurityPolicy?.ContentSecurityPolicy || "";
const customHeaders = new Map((edgePolicy.CustomHeadersConfig?.Items || []).map((item) => [String(item.Header).toLowerCase(), item.Value]));
expect(securityHeaders.FrameOptions?.FrameOption === "DENY", "CloudFront policy denies framing");
expect(securityHeaders.ContentTypeOptions?.Override === true, "CloudFront policy enables nosniff");
expect(securityHeaders.StrictTransportSecurity?.AccessControlMaxAgeSec >= 31_536_000, "CloudFront policy enables long-lived HSTS");
expect(csp.includes("default-src 'self'"), "CSP defaults to same origin");
expect(csp.includes("object-src 'none'"), "CSP disables plugin/object content");
expect(csp.includes("frame-ancestors 'none'"), "CSP blocks clickjacking ancestors");
expect(csp.includes("script-src-attr 'none'"), "CSP blocks inline event-handler attributes");
expect(csp.includes("https://api.weather.gov"), "CSP explicitly allows the NWS API");
expect(csp.includes("https://api.web3forms.com"), "CSP explicitly allows Web3Forms");
expect(!/connect-src[^;]*\*/.test(csp), "CSP does not wildcard outbound connections");
expect(customHeaders.get("permissions-policy")?.includes("camera=()"), "Permissions-Policy disables camera access");
expect(customHeaders.get("permissions-policy")?.includes("geolocation=()"), "Permissions-Policy disables browser geolocation");
expect(customHeaders.get("cross-origin-opener-policy") === "same-origin", "COOP isolates the top-level browsing context");
expect(customHeaders.get("cross-origin-resource-policy") === "same-origin", "CORP protects static resources from cross-origin embedding");

for (const file of runtimeFiles.filter((file) => /\.(jsx?|mjs)$/.test(file))) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  for (const match of source.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)) {
    expect(/rel=["'][^"']*(?:noopener|noreferrer)[^"']*["']/.test(match[0]), `${relative} protects target=_blank links`);
  }
  for (const match of source.matchAll(/http:\/\/[^\s"'`)]+/g)) {
    const candidate = match[0].replace(/[>,.;]+$/, "");
    const allowedIdentifier = NON_NETWORK_HTTP_IDENTIFIERS.has(candidate);
    const allowedLocalhost = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/.test(candidate);
    expect(allowedIdentifier || allowedLocalhost, `${relative} has no insecure external HTTP URLs`);
  }
}

const privacyPage = read("app/privacy-tools/page.js");
expect(privacyPage.includes("index: false"), "privacy tools page is noindex");
const robots = read("app/robots.js");
expect(robots.includes('"/privacy-tools"'), "robots policy disallows privacy tools route");

const journeyPage = read("app/my-growing-journey/page.js");
expect(
  journeyPage.includes("robots: { index: false, follow: false }"),
  "Growing Journey private workspace is noindex"
);
expect(
  robots.includes('"/my-growing-journey"'),
  "robots policy disallows Growing Journey private workspace"
);

const sitemap = read("app/sitemap.js");
expect(
  !sitemap.includes('"/my-growing-journey"'),
  "public sitemap excludes Growing Journey private workspace"
);
expect(
  !sitemap.includes('"/learn/garden-layout-builder"'),
  "public sitemap excludes private Garden Layout Builder"
);

expect(
  robots.includes('"/learn/garden-layout-builder"'),
  "robots disallows private Garden Layout Builder"
);
expect(
  robots.includes('"/farm-os"'),
  "robots disallows the private Farm OS namespace"
);

const publicPrivateRoutePairs = [
  { label: "experiments", route: "/experiments", publicFile: "app/experiments/page.js", privateFile: "app/farm-os/experiments/page.js" },
  { label: "harvest", route: "/harvest", publicFile: "app/harvest/page.js", privateFile: "app/farm-os/harvest/page.js" },
  { label: "farm journal", route: "/farm-journal", publicFile: "app/farm-journal/page.js", privateFile: "app/farm-os/journal/page.js" },
  { label: "season timeline", route: "/timeline", publicFile: "app/timeline/page.js", privateFile: "app/farm-os/timeline/page.js" },
  { label: "farm calendar", route: "/farm-calendar", publicFile: "app/farm-os/calendar/page.js", privateFile: "app/farm-os/calendar/page.js" },
  { label: "farm map", route: "/farm-map", publicFile: "app/farm-map/page.js", privateFile: "app/farm-os/map/page.js" },
  { label: "farm planner", route: "/farm-planner", publicFile: "app/farm-planner/page.js", privateFile: "app/farm-os/planner/page.js" },
];

for (const pair of publicPrivateRoutePairs) {
  const publicSource = read(pair.publicFile);
  const privateSource = read(pair.privateFile);
  expect(!publicSource.includes("index: false"), `${pair.label} public route remains indexable`);
  expect(privateSource.includes("index: false"), `${pair.label} private Farm OS route remains noindex`);
  expect(sitemap.includes(`"${pair.route}"`), `${pair.label} public route remains in sitemap`);
  expect(!robots.includes(`"${pair.route}"`), `${pair.label} public route is not blocked by robots`);
}

const preservedPublicDocuments = [
  "public/documents/alec-price-master-farm-manager.pdf",
  "public/documents/price-family-farm-registration.pdf",
  "public/images/documents/farm-name-registration.webp",
  "public/images/documents/master-farm-manager.webp",
];
for (const relative of preservedPublicDocuments) {
  expect(fs.existsSync(path.join(root, relative)), `${relative} remains in the deployable public tree`);
}

const documentationSource = read("app/documentation/page.js");
expect(documentationSource.includes("/documents/price-family-farm-registration.pdf"), "documentation links the farm registration PDF");
expect(documentationSource.includes("/documents/alec-price-master-farm-manager.pdf"), "documentation links the Master Farm Manager PDF");

expect(!fs.existsSync(path.join(root, ".env")), ".env is not committed");
expect(!fs.existsSync(path.join(root, ".env.local")), ".env.local is not committed");
const cloudFrontApply = read("scripts/apply-cloudfront-security.sh");
expect(
  cloudFrontApply.includes("67f7725c-6f97-4210-82d7-5512b31e9d03"),
  "CloudFront apply script uses AWS managed SecurityHeadersPolicy"
);
expect(
  cloudFrontApply.includes("deploy/cloudfront-security-headers-function.js"),
  "CloudFront apply script manages the viewer-response security function"
);
expect(
  cloudFrontApply.includes("publish-function"),
  "CloudFront apply script publishes the validated security function"
);
expect(
  !cloudFrontApply.includes("create-response-headers-policy"),
  "CloudFront apply script does not create Free-plan-incompatible custom response policies"
);
expect(
  !cloudFrontApply.includes("update-response-headers-policy"),
  "CloudFront apply script does not update Free-plan-incompatible custom response policies"
);

expect(fs.existsSync(path.join(root, "public/.well-known/security.txt")), "security.txt is published");

if (failures.length) {
  console.error(`Security verification failed (${failures.length}/${checks.length}):`);
  failures.forEach((failure) => console.error(`FAIL: ${failure}`));
  process.exit(1);
}

console.log(`Security verification passed: ${checks.length} checks.`);
