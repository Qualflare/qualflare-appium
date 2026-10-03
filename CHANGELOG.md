# Changelog

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
