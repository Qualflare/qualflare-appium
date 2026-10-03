import { qualflare } from '@qualflare/appium/runtime';

describe('Login', () => {
  it('signs in', async () => {
    qualflare.label('owner', 'mobile');
    await browser.url('data:text/html,<h1>login</h1>');
    await browser.takeScreenshot();
  });
});
