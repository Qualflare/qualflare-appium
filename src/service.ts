/**
 * `@qualflare/appium/service`, for the string form:
 *
 * ```js
 * services: ['appium', '@qualflare/appium/service']
 * ```
 *
 * `@qualflare/webdriverio`'s launcher service, unchanged. WebdriverIO constructs
 * a string entry's `launcher` export in the launcher and, finding no `default`,
 * nothing in the workers.
 */
export { launcher, QualflareService } from '@qualflare/webdriverio/service';
