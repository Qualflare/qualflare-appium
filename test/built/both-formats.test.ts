import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

/** Loads the BUILT package, every entry in both formats. A reporter-family
 * package once passed every other check while its CJS build could not be
 * constructed; shipping two formats means testing two formats. */
const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../..');
const dist = path.join(root, 'dist');

beforeAll(() => {
  if (!fs.existsSync(dist)) {
    throw new Error(`dist/ is missing — run \`npm run build\` before this suite (looked in ${dist})`);
  }
});

type Ctor = new (options: Record<string, unknown>) => { emit: unknown; isSynchronised: unknown };

function assertReporter(Reporter: unknown, label: string): void {
  expect(typeof Reporter, `${label}: the default export must be a constructor`).toBe('function');
  const instance = new (Reporter as Ctor)({ enabled: false, writeStream: { write: () => true } });
  expect(typeof instance.emit, `${label}: emit`).toBe('function');
  expect(instance.isSynchronised, `${label}: isSynchronised`).toBe(true);
}

describe('the built package', () => {
  it('main entry, ESM and CJS: the reporter constructs, and no launcher is exported', async () => {
    const esm = (await import(path.join(dist, 'index.js'))) as Record<string, unknown>;
    const cjs = require(path.join(dist, 'index.cjs')) as Record<string, unknown>;
    assertReporter(esm.default, 'ESM');
    assertReporter(cjs.default ?? cjs.QualflareAppiumReporter, 'CJS');
    for (const mod of [esm, cjs]) {
      expect(typeof mod.QualflareService).toBe('function');
      expect(typeof mod.withAppiumDefaults).toBe('function');
      expect(mod.launcher).toBeUndefined();
    }
  });

  it('./service exposes a launcher and no default, in both formats', async () => {
    const esm = (await import(path.join(dist, 'service.js'))) as Record<string, unknown>;
    const cjs = require(path.join(dist, 'service.cjs')) as Record<string, unknown>;
    for (const mod of [esm, cjs]) {
      expect(typeof mod.launcher).toBe('function');
      expect(mod.default).toBeUndefined();
    }
  });

  // The whole point of not bundling: one runtime, one state, whichever package
  // a spec file imports qualflare from.
  it('./runtime is @qualflare/webdriverio\'s own qualflare, not a copy', async () => {
    const ours = (await import(path.join(dist, 'runtime.js'))) as { qualflare: unknown };
    const theirs = (await import('@qualflare/webdriverio/runtime')) as { qualflare: unknown };
    expect(ours.qualflare).toBe(theirs.qualflare);
    for (const file of ['index.js', 'index.cjs', 'runtime.js', 'service.js']) {
      expect(fs.readFileSync(path.join(dist, file), 'utf8')).not.toContain('Symbol.for("qualflare.webdriverio.runtime")');
    }
  });
});
