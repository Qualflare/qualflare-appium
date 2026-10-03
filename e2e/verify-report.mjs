#!/usr/bin/env node
/**
 * Asserts that the dogfood run produced the reports it was supposed to, BEFORE
 * the upload. A reporter can lose a field and still emit a plausible report; only
 * reading the report proves it was recorded.
 *
 * What only a real Appium session can prove is asserted here: the platform is
 * ios (mobile Safari reports a browser too, which must not make it "web"), the
 * device capabilities XCUITest returns unprefixed are on every case, and the
 * legacy `platform: MAC` capability the same session carries was never read.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const SPEC_FILES = 2;
const MASKED_SECRET = 'qf-dogfood-secret-value';
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const resultsDir = process.env.QUALFLARE_RESULTS_DIR ?? './e2e-results';

const failures = [];
const check = (label, ok, detail = '') => {
  if (!ok) failures.push(detail ? `${label} — ${detail}` : label);
};

if (!fs.existsSync(resultsDir)) {
  console.error(`✗ ${resultsDir} does not exist. Did the suite run?`);
  process.exit(1);
}
const files = fs.readdirSync(resultsDir).filter((f) => f.endsWith('.json'));
if (files.length !== SPEC_FILES) {
  console.error(`✗ expected ${SPEC_FILES} reports in ${resultsDir} (one per worker), found ${files.length}`);
  process.exit(1);
}
const raws = files.map((f) => fs.readFileSync(path.join(resultsDir, f), 'utf8'));
const reports = raws.map((r) => JSON.parse(r));
const cases = reports.flatMap((r) => r.suites.flatMap((s) => s.cases));
const named = (name) => cases.find((c) => c.name.includes(name));

for (const report of reports) {
  check('framework is appium', report.framework === 'appium', `got ${report.framework}`);
  check('platform is ios, not web', report.platform === 'ios', `got ${report.platform}`);
  check('browser is Safari', report.browser === 'Safari', `got ${report.browser}`);
  for (const suite of report.suites) check('suite category is appium', suite.category === 'appium', suite.category);
}
const runIds = new Set(reports.map((r) => r.metadata?.runId));
check('every worker shares one runId', runIds.size === 1, [...runIds].join(', '));
check('four cases reported', cases.length === 4, `got ${cases.length}`);
const notPassed = cases.filter((c) => c.status !== 'passed');
check('every case passed', notPassed.length === 0, notPassed.map((c) => `${c.name}=${c.status}`).join(', '));

for (const testCase of cases) {
  const p = testCase.properties ?? {};
  check(`${testCase.name}: platformName recorded`, p.platformName?.toLowerCase() === 'ios', p.platformName);
  check(`${testCase.name}: automationName recorded`, p.automationName === 'XCUITest', p.automationName);
  check(`${testCase.name}: deviceName recorded`, Boolean(p.deviceName), JSON.stringify(p));
  check(`${testCase.name}: platformVersion recorded`, Boolean(p.platformVersion), JSON.stringify(p));
  check(`${testCase.name}: id carries the capability`, testCase.id.endsWith('@ios-safari'), testCase.id);
}
check('the legacy `platform: MAC` capability was never read', !raws.join('').includes('"MAC"'));
check('masked value never reaches the report', !raws.join('').includes(MASKED_SECRET));

const meta = named('records the author-facing metadata API');
check('metadata case present', Boolean(meta));
if (meta) {
  check('label recorded', meta.labels?.some((l) => l.name === 'team' && l.value === 'mobile'));
  check('tag recorded', meta.tags?.includes('dogfood'));
  check('step recorded', meta.steps?.[0]?.name === 'render the page');
}

const shotCase = named('attaches a screenshot Appium took');
const shot = shotCase?.attachments?.find((a) => a.mimeType === 'image/png');
check('screenshot attached', Boolean(shot));
if (shot?.localImagePath) {
  const shotPath = path.join(resultsDir, shot.localImagePath);
  check('screenshot file exists', fs.existsSync(shotPath), shotPath);
  if (fs.existsSync(shotPath)) {
    check('screenshot really is a PNG', fs.readFileSync(shotPath).subarray(0, 8).equals(PNG_MAGIC));
  }
}

const flaky = named('fails once, then passes');
check('flaky case present', Boolean(flaky));
if (flaky) {
  check('isFlaky set', flaky.isFlaky === true);
  check(
    'attempts are [failed, passed]',
    JSON.stringify(flaky.attempts?.map((a) => a.status)) === '["failed","passed"]',
    JSON.stringify(flaky.attempts?.map((a) => a.status)),
  );
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} assertion(s) failed against ${resultsDir}:\n`);
  for (const f of failures) console.error(`    - ${f}`);
  process.exit(1);
}
const device = cases[0].properties;
console.log(
  `✓ ${cases.length} cases across ${files.length} workers verified on ${device.deviceName} (iOS ${device.platformVersion}), one runId`,
);
