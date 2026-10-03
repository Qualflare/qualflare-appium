let attempts = 0;

describe('Checkout', function () {
  this.retries(1);

  it('pays on the second attempt', async () => {
    attempts += 1;
    await browser.url('data:text/html,<h1>checkout</h1>');
    if (attempts === 1) {
      throw new Error('first attempt fails');
    }
  });
});
