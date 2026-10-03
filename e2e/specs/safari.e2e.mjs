import { qualflare } from '@qualflare/appium/runtime';

// The page is written in place rather than loaded: no network dependency, and
// no reliance on how Safari treats data: URLs at the top level.
async function showHeading(text) {
  await browser.url('about:blank');
  await browser.execute((t) => {
    document.body.innerHTML = `<h1 id="t">${t}</h1>`;
  }, text);
}

describe('mobile safari', () => {
  it('records the author-facing metadata API', async () => {
    qualflare.label('team', 'mobile');
    qualflare.tag('dogfood');
    qualflare.parameter('api-key', 'qf-dogfood-secret-value', { masked: true });
    await qualflare.step('render the page', async () => {
      await showHeading('appium');
    });
    await expect($('#t')).toHaveText('appium');
  });

  it('attaches a screenshot Appium took', async () => {
    await showHeading('screenshot');
    await browser.takeScreenshot();
  });
});
