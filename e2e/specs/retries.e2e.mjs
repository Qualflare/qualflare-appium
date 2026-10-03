// A flaky test that ENDS GREEN; the counter survives the retry, which runs in
// the same worker.
let attempts = 0;

describe('retries', function () {
  this.retries(1);

  it('fails once, then passes', async () => {
    attempts += 1;
    await browser.url('about:blank');
    if (attempts < 2) {
      throw new Error('deliberate first-attempt failure');
    }
  });
});
