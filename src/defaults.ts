import type { QualflareWebdriverioOptions } from '@qualflare/webdriverio';

/** The reporter's options are `@qualflare/webdriverio`'s, minus the framework
 * label, which this package decides: an Appium run reports as `appium`. */
export type QualflareAppiumOptions = Omit<QualflareWebdriverioOptions, 'framework'>;

/**
 * The options handed to the WebdriverIO reporter: the caller's, unchanged, with
 * `framework: 'appium'`.
 *
 * The label is set last on purpose, so it cannot be overridden. "The package
 * decides" is the whole contract: someone who wants a run labelled
 * `webdriverio` uses `@qualflare/webdriverio` directly.
 *
 * Everything else, including the keys WebdriverIO itself merges into a
 * reporter's options (`logFile`, `writeStream`), passes through untouched.
 */
export function withAppiumDefaults(
  options: QualflareAppiumOptions & Record<string, unknown> = {},
): QualflareWebdriverioOptions & Record<string, unknown> {
  return { ...options, framework: 'appium' };
}
