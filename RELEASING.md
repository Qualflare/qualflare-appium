# Releasing

1. Make sure `main` is green: CI (unit, built formats, real WebdriverIO runs on
   8 and 9, packaged tarball, no-network) and the latest E2E run on a real iOS
   simulator. Dispatch E2E by hand if the last scheduled run is old.
2. If the release needs a newer `@qualflare/webdriverio`, publish that first and
   raise the dependency here.
3. Bump `version` in `package.json` and date the `CHANGELOG.md` entry.
4. Commit `chore: release vX.Y.Z`, then `git tag -a vX.Y.Z -m vX.Y.Z` and push the
   tag. `.github/workflows/npm-publish.yml` checks the tag against the version,
   re-runs the gate, publishes with provenance, and waits until the version
   resolves with provenance attached.

Publishing needs the `NPM_TOKEN` secret; a local `npm publish` fails by design.
The E2E upload needs `QF_TOKEN` and the Qualflare project `qualflare-appium`, with
public reports enabled for the badge.
