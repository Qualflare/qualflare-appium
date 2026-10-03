# @qualflare/appium

[![npm version](https://img.shields.io/npm/v/%40qualflare%2Fappium.svg)](https://www.npmjs.com/package/@qualflare/appium)
[![CI](https://github.com/Qualflare/qualflare-appium/actions/workflows/ci.yml/badge.svg)](https://github.com/Qualflare/qualflare-appium/actions/workflows/ci.yml)
[![Qualflare](https://api.qualflare.com/p/qualflare-appium/badge.svg)](https://reports.qualflare.com/p/qualflare-appium/launches)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)

Qualflare reporting for **Appium suites run through WebdriverIO**. It records iOS
and Android results with the device each test ran on, per-attempt retry history
and flakiness, and the screenshots Appium takes. Runs show up in Qualflare as
**Appium**.

The reporter is
[`@qualflare/webdriverio`](https://github.com/Qualflare/qualflare-webdriverio)'s.
This package fixes the label to `appium` and adds nothing else, so everything in
that package's documentation applies here unchanged.

Driving Appium from **Java or Python** instead? Use the reporter for your test
runner: [`qualflare-testng`](https://github.com/Qualflare/qualflare-testng),
[`qualflare-junit5`](https://github.com/Qualflare/qualflare-junit5) or
[`qualflare-pytest`](https://github.com/Qualflare/qualflare-pytest).

## Install

```bash
npm install --save-dev @qualflare/appium
```

Requires WebdriverIO **8 or 9** and Node `>=18.20`. Upload with
[`@qualflare/cli`](https://github.com/Qualflare/qualflare-cli) **v0.1.37 or
newer**, the first release that knows the `appium` label. An older CLI uploads
the same results under the category `generic`.

## Setup

Add the reporter **and** its service to `wdio.conf`:

```js
export const config = {
  // ...
  capabilities: [{
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': 'iPhone 17 Pro',
    'appium:app': './build/MyApp.app',
  }],
  services: ['appium', '@qualflare/appium/service'],
  reporters: ['spec', ['@qualflare/appium', { environment: 'staging' }]],
};
```

```bash
npx wdio run wdio.conf.js
qf <your-project> collect ./qualflare-results
```

The service is required, not optional. Each spec file runs in its own worker,
each worker writes its own report, and `qf collect` merges only the files that
share one run id. Without the service, the workers can't agree on one, and the
upload would carry a single spec file's results. See
[`@qualflare/webdriverio`'s Setup](https://github.com/Qualflare/qualflare-webdriverio#setup).

## What you get

| | |
|---|---|
| **Platform** | `ios` or `android` from `platformName`. Mobile Safari is `ios`, not `web`, although it also names a browser |
| **Device** | `platformName`, `platformVersion`, `deviceName`, `automationName` (and `browserName` for a browser session) on every case. Read the way a real XCUITest session returns them: unprefixed, not as `appium:*` |
| **History** | Each test's id includes the platform (`@ios`, `@android`, `@ios-safari`), so one suite run on iOS and Android keeps two histories. Moving to a newer simulator or device model keeps the history |
| **Screenshots** | Every `driver.takeScreenshot()` / `saveScreenshot()`, attached to the test and attempt it belongs to, including from `afterTest` |
| **Retries** | Mocha `this.retries(n)`: one case with every attempt's error and timing; `isFlaky` when it passed on a retry |

Metadata (`qualflare.label()`, `.step()`, `.parameter()` and the rest) is available
from `@qualflare/appium/runtime`, and works as documented in
[METADATA-API](https://github.com/Qualflare/qualflare-webdriverio/blob/main/docs/METADATA-API.md).
Configuration and known limitations are
[`@qualflare/webdriverio`'s](https://github.com/Qualflare/qualflare-webdriverio/tree/main/docs),
except that the framework label isn't configurable here.

## How this is tested

- On every change, a real two-worker WebdriverIO run loads this package by name
  on WebdriverIO 8 and 9.
- Weekly, a real Appium session drives mobile Safari on an iOS simulator on a
  macOS runner. It asserts `platform: ios`, the device capabilities and the
  screenshot, then uploads to Qualflare. That's the badge above.

## Development

```bash
npm install
npm test && npm run test:built && npm run test:integration
# The real-simulator dogfood: boot a simulator first
SIM_UDID=… SIM_NAME="iPhone 17 Pro" SIM_VERSION=26.0 npm run e2e
```

## Test reports

This package reports its own dogfood suite to Qualflare, through itself: the
reporter under test is the one that produced these runs, uploaded by the
**published** `qualflare-cli`. Every run is a real Appium session on an iOS simulator.

[![Qualflare](https://api.qualflare.com/p/qualflare-appium/banner.svg)](https://reports.qualflare.com/p/qualflare-appium/launches)

## License

Apache-2.0
