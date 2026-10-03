# Changelog

## 0.2.0 — 2026-10-03

- Builds on `@qualflare/webdriverio` 0.2.0, so the service is now optional:
  every worker of one `wdio run` derives the same run id from the launcher
  process. `services: ['appium']` alone is enough. Add
  `@qualflare/appium/service` only when you run WebdriverIO programmatically
  more than once in one Node process, or to clean stale reports.
- The weekly real-simulator E2E now runs without the service, so a real
  XCUITest session proves the new default.

## 0.1.0 — 2026-10-03

Initial release.

- The reporter: `reporters: ['@qualflare/appium']`. It is
  `@qualflare/webdriverio`'s reporter labelled `appium`, by composition rather
  than inheritance, so the two packages version independently.
- `@qualflare/appium/service` and `/runtime`, re-exporting the WebdriverIO
  package's service and metadata API unchanged. They are the same objects, so
  their state is shared.
- The `appium` label is fixed: a run that should be labelled `webdriverio` uses
  `@qualflare/webdriverio`.

Needs `@qualflare/cli` v0.1.37 or newer to upload as `appium`; older CLIs upload
as `generic`.
