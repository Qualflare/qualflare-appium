import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * A real WebdriverIO run, two workers, loading @qualflare/appium by name from
 * built dist/. The package is linked under its own name because WebdriverIO
 * resolves `reporters: ['@qualflare/appium']` from inside @wdio/utils.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const fixtureDir = path.join(here, 'fixtures/wdio-project');
let resultsDir: string;
let reports: { framework: string; platform?: string; metadata: { runId: string }; suites: { category: string; cases: Record<string, unknown>[] }[] }[];

beforeAll(async () => {
  if (!fs.existsSync(path.join(repoRoot, 'dist/index.js'))) {
    throw new Error('dist/ is missing: run `npm run build` before the integration suite.');
  }
  const link = path.join(repoRoot, 'node_modules/@qualflare/appium');
  fs.rmSync(link, { recursive: true, force: true });
  fs.symlinkSync('../..', link, 'dir');

  resultsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qualflare-appium-integration-'));
  const env: Record<string, string | undefined> = { ...process.env, QUALFLARE_RESULTS_DIR: resultsDir };
  for (const name of Object.keys(env)) {
    if (name === 'QUALFLARE_RUN_ID' || name === 'CI' || /^(GITHUB_|GITLAB_|CI_|BUILDKITE|CIRCLE|JENKINS|TF_BUILD|BITBUCKET)/.test(name)) {
      delete env[name];
    }
  }
  const result = await execa('npx', ['wdio', 'run', 'wdio.conf.mjs'], { cwd: fixtureDir, env, extendEnv: false, reject: false });
  reports = fs
    .readdirSync(resultsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(resultsDir, f), 'utf8')));
  if (reports.length === 0) {
    throw new Error(`no report written. exit=${result.exitCode}\n${result.stdout}\n${result.stderr}`);
  }
});

afterAll(() => {
  fs.rmSync(resultsDir, { recursive: true, force: true });
});

const allCases = () => reports.flatMap((r) => r.suites.flatMap((s) => s.cases));

describe('@qualflare/appium against a real WebdriverIO run', () => {
  it('labels every worker\'s report appium, and the workers share one runId', () => {
    expect(reports).toHaveLength(2);
    expect(new Set(reports.map((r) => r.metadata.runId)).size).toBe(1);
    for (const report of reports) {
      expect(report.framework).toBe('appium');
      for (const suite of report.suites) expect(suite.category).toBe('appium');
    }
  });

  it('records metadata from @qualflare/appium/runtime and the screenshot', () => {
    const login = allCases().find((c) => c.name === 'Login signs in')!;
    expect(login.labels).toEqual([{ name: 'owner', value: 'mobile' }]);
    expect((login.attachments as { name: string }[]).map((a) => a.name)).toEqual(['Screenshot']);
  });

  it('keeps retry history', () => {
    const checkout = allCases().find((c) => c.name === 'Checkout pays on the second attempt')!;
    expect(checkout.isFlaky).toBe(true);
    expect((checkout.attempts as { status: string }[]).map((a) => a.status)).toEqual(['failed', 'passed']);
  });
});
