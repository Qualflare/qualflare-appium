/**
 * `@qualflare/appium`: Qualflare reporting for Appium suites run through
 * WebdriverIO.
 *
 * The reporter IS `@qualflare/webdriverio`'s. This package fixes its label to
 * `appium` and adds Appium-shaped documentation, nothing else. Appium driven from
 * Java or Python is covered by the reporter for that runner (TestNG, JUnit 5,
 * pytest); this package is for Appium's JavaScript client, WebdriverIO.
 *
 * The DEFAULT export is the reporter, because that is what WebdriverIO takes from
 * a module named in `reporters: ['@qualflare/appium']`. Like the WebdriverIO
 * package, this entry exports no `launcher`: see `@qualflare/appium/service`.
 */
import QualflareAppiumReporter from './reporter.js';

export default QualflareAppiumReporter;
export { QualflareAppiumReporter };
export { withAppiumDefaults, type QualflareAppiumOptions } from './defaults.js';

/** Re-exported unchanged, so an Appium project needs one Qualflare import. They
 * are the same functions and classes, not copies: the runtime state that
 * `qualflare.*()` writes and the reporter reads is shared. */
export { QualflareService, ensureRunId, qualflare, resolveCapabilities } from '@qualflare/webdriverio';
export type {
  QualflareServiceOptions,
  CapabilityInfo,
  Attachment,
  Case,
  CasePriority,
  CaseStatus,
  Collect,
  Label,
  Link,
  LinkType,
  Platform,
  Step,
  Suite,
} from '@qualflare/webdriverio';
