// Loads @qualflare/appium BY NAME in both string forms, through the real
// exports map of the built package. Headless Chrome stands in for a device: the
// property under test here is the composition and the label, which do not
// depend on what the session drives. A real Appium session is e2e/'s job.
export const config = {
  runner: 'local',
  specs: ['./specs/**/*.spec.mjs'],
  maxInstances: 2,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': { args: ['--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=800,600'] },
    },
  ],
  logLevel: 'error',
  framework: 'mocha',
  mochaOpts: { timeout: 60000 },
  services: [['@qualflare/appium/service', { resultsDir: process.env.QUALFLARE_RESULTS_DIR }]],
  reporters: [['@qualflare/appium', { resultsDir: process.env.QUALFLARE_RESULTS_DIR }]],
};
