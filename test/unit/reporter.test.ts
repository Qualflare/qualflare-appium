import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { QualflareWebdriverioReporter } from '@qualflare/webdriverio';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { withAppiumDefaults } from '../../src/defaults.js';
import QualflareAppiumReporter from '../../src/reporter.js';

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qf-appium-'));
  vi.stubEnv('QUALFLARE_RUN_ID', 'run-under-test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('withAppiumDefaults', () => {
  it('labels the run appium', () => {
    expect(withAppiumDefaults().framework).toBe('appium');
  });

  // "The package decides": the label is not an option. A run that should say
  // webdriverio uses @qualflare/webdriverio.
  it('cannot be talked out of the appium label', () => {
    const sneaky = { framework: 'webdriverio' } as Parameters<typeof withAppiumDefaults>[0];
    expect(withAppiumDefaults(sneaky).framework).toBe('appium');
  });

  it('passes every other option through, including the keys WebdriverIO adds', () => {
    const writeStream = { write: () => true };
    const out = withAppiumDefaults({ resultsDir: './out', environment: 'staging', writeStream });
    expect(out).toMatchObject({ resultsDir: './out', environment: 'staging', writeStream });
  });

  it('never mutates the options it was given', () => {
    const given = { environment: 'staging' };
    withAppiumDefaults(given);
    expect(given).toEqual({ environment: 'staging' });
  });
});

describe('QualflareAppiumReporter', () => {
  const make = () =>
    new QualflareAppiumReporter({ resultsDir: dir, branch: 'main', commit: 'abc', writeStream: { write: () => true } });

  // Composition, not inheritance: what WebdriverIO gets back is the WebdriverIO
  // reporter itself, so every hook it calls is that package's.
  it('hands WebdriverIO a @qualflare/webdriverio reporter', () => {
    const reporter = make();
    expect(reporter).toBeInstanceOf(QualflareWebdriverioReporter);
    expect(Object.getPrototypeOf(QualflareAppiumReporter.prototype)).toBe(Object.prototype);
  });

  it('writes a report labelled appium, with the platform and device from an Appium session', () => {
    const reporter = make() as unknown as QualflareWebdriverioReporter;
    const file = 'file:///project/test/specs/login.spec.js';
    reporter.emit('runner:start', {
      cid: '0-0',
      specs: [file],
      // As a real XCUITest session returns them: unprefixed, plus the legacy
      // `platform: MAC` that must never be read.
      capabilities: { platformName: 'iOS', platform: 'MAC', deviceName: 'iPhone 17 Pro', platformVersion: '26.5', automationName: 'XCUITest' },
      config: { rootDir: '/project', framework: 'mocha' },
      isMultiremote: false,
      sessionId: 's',
    });
    reporter.emit('suite:start', { title: 'Login', fullTitle: 'Login', file, uid: 'suite-1', cid: '0-0' });
    reporter.emit('test:start', { title: 'signs in', fullTitle: 'Login signs in', uid: 't-1', cid: '0-0', pending: false, specs: [] });
    reporter.emit('test:pass', { title: 'signs in', fullTitle: 'Login signs in', uid: 't-1', cid: '0-0' });
    reporter.emit('test:end', { title: 'signs in', fullTitle: 'Login signs in', uid: 't-1', cid: '0-0' });
    reporter.emit('suite:end', { title: 'Login', fullTitle: 'Login', file, uid: 'suite-1', cid: '0-0' });
    reporter.emit('runner:end', { failures: 0, cid: '0-0', retries: 0 });

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    expect(files).toHaveLength(1);
    const report = JSON.parse(fs.readFileSync(path.join(dir, files[0]!), 'utf8'));
    expect(report.framework).toBe('appium');
    expect(report.platform).toBe('ios');
    expect(report.suites[0].category).toBe('appium');
    const testCase = report.suites[0].cases[0];
    expect(testCase.id).toBe('test/specs/login.spec.js#Login signs in@ios');
    expect(testCase.properties).toMatchObject({ deviceName: 'iPhone 17 Pro', platformVersion: '26.5', automationName: 'XCUITest' });
  });
});
