import { QualflareWebdriverioReporter } from '@qualflare/webdriverio';

import { withAppiumDefaults, type QualflareAppiumOptions } from './defaults.js';

/**
 * The Qualflare reporter for Appium suites driven through WebdriverIO.
 *
 * This package USES `@qualflare/webdriverio`'s reporter; it does not extend it.
 * The constructor returns a WebdriverIO reporter configured with Appium's label,
 * and that instance is what WebdriverIO talks to. Returning an object from a
 * constructor replaces `this`, and @wdio/runner needs nothing from a reporter
 * but `emit()`, `isSynchronised` and its class name (measured: no `instanceof`
 * check), so every hook is forwarded with no surface here to keep in step.
 *
 * Extending was rejected for two reasons. A subclass would depend on the base's
 * constructor across two independently versioned packages. And this class must
 * not be a `WDIOReporter` itself: its `super()` would open a second log file of
 * its own, unused, beside the real reporter's.
 *
 * There is no Appium-specific reporting logic here. What Appium adds that a
 * reporter can see is the session's capabilities: `platformName`, `deviceName`,
 * `platformVersion`, `automationName`. `@qualflare/webdriverio` already reads
 * them, including the unprefixed form a real XCUITest session returns.
 */
export default class QualflareAppiumReporter {
  constructor(options: QualflareAppiumOptions & Record<string, unknown> = {}) {
    return new QualflareWebdriverioReporter(withAppiumDefaults(options));
  }
}
