// No Qualflare service on purpose: since @qualflare/webdriverio 0.2.0 the
// workers derive one run id from the launcher, and this run proves that on a
// real Appium session every week (the verifier asserts one runId).
//
// The dogfood run: @qualflare/appium reports on a REAL Appium session -- the
// XCUITest driver driving mobile Safari on an iOS simulator -- loaded by name
// from built dist/, exactly as a user configures it. Two spec files, so two
// workers that must agree on one runId.
//
// The simulator is chosen by the workflow (whatever iPhone the runner has) and
// passed in through SIM_UDID / SIM_NAME / SIM_VERSION. Locally, set those to a
// booted simulator: `xcrun simctl list devices booted`.
//
// NO failing tests, by construction: this run is uploaded, so red has to mean a
// real regression rather than fixture noise.
for (const name of ['SIM_UDID', 'SIM_NAME', 'SIM_VERSION']) {
  if (!process.env[name]) {
    throw new Error(`${name} is not set; see the comment at the top of e2e/wdio.conf.mjs`);
  }
}

export const config = {
  runner: 'local',
  specs: ['./specs/**/*.e2e.mjs'],
  // One simulator, so one session at a time; the spec files still run in
  // separate workers, one after the other.
  maxInstances: 1,
  capabilities: [
    {
      platformName: 'iOS',
      browserName: 'Safari',
      'appium:automationName': 'XCUITest',
      'appium:udid': process.env.SIM_UDID,
      'appium:deviceName': process.env.SIM_NAME,
      'appium:platformVersion': process.env.SIM_VERSION,
      // Building and launching WebDriverAgent on a cold runner takes minutes.
      'appium:wdaLaunchTimeout': 600000,
      'appium:newCommandTimeout': 600,
    },
  ],
  logLevel: 'error',
  framework: 'mocha',
  mochaOpts: { timeout: 600000 },
  connectionRetryTimeout: 600000,
  connectionRetryCount: 1,
  // @wdio/appium-service starts the Appium server for the run and stops it after.
  services: [
    ['appium', { command: 'appium', args: { port: 4723 } }],
  ],
  port: 4723,
  reporters: ['spec', ['@qualflare/appium', { resultsDir: '../e2e-results', environment: 'production' }]],
};
