import fs from "node:fs";

const workflow = fs.readFileSync(".github/workflows/quality.yml", "utf8");

const checks = [
  ["dependency audit has a step id", "id: dependency_audit"],
  ["dependency audit is captured for diagnostics", "npm audit --audit-level=high 2>&1 | tee dependency-audit.log"],
  ["Farm OS contracts have a step id", "id: farm_os"],
  ["Farm OS contracts are captured for diagnostics", "node scripts/verify-farm-os.mjs 2>&1 | tee farm-os.log"],
  ["quality workflow self-contracts have a step id", "id: ci_contracts"],
  ["quality workflow self-contracts are captured for diagnostics", "node scripts/verify-quality-workflow.mjs 2>&1 | tee ci-workflow.log"],
  ["source failure reporting includes dependency audit", "steps.dependency_audit.outcome == 'failure'"],
  ["source failure reporting includes Farm OS contracts", "steps.farm_os.outcome == 'failure'"],
  ["source failure reporting includes workflow contracts", "steps.ci_contracts.outcome == 'failure'"],
  ["Playwright browser cache uses pinned actions/cache", "actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0"],
  ["Playwright browser cache targets the browser store", "path: ~/.cache/ms-playwright"],
  ["Playwright browser cache key is versioned", "key: playwright-${{ runner.os }}-${{ runner.arch }}-1.62.1"],
  ["browser install has a step id", "id: browser_install"],
  ["browser installation is captured for diagnostics", "browser-install.log"],
  ["static export server has a step id", "id: serve"],
  ["static export server is captured for diagnostics", "static-server.log"],
  ["browser failure reporting includes browser install", "steps.browser_install.outcome == 'failure'"],
  ["browser failure reporting includes static server", "steps.serve.outcome == 'failure'"],
  ["browser failure reporting includes browser tests", "steps.browser.outcome == 'failure'"],
  ["failure artifacts include dependency audit log", "dependency-audit.log"],
  ["failure artifacts include Farm OS log", "farm-os.log"],
  ["failure artifacts include CI workflow log", "ci-workflow.log"],
  ["failure artifacts include browser install log", "browser-install.log"],
  ["failure artifacts include static server log", "static-server.log"],
];

const failures = [];
for (const [label, needle] of checks) {
  if (!workflow.includes(needle)) failures.push(label);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  console.error(`Quality workflow verification failed: ${failures.length}/${checks.length} checks failed.`);
  process.exit(1);
}

console.log(`Quality workflow verification passed: ${checks.length} checks.`);
