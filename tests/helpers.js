const { expect } = require('@playwright/test');

/** Seed used for `Random` in all scene tests. */
const DEFAULT_SEED = 'test1234';

/**
 * Asserts that the santa-overlay game over screen is visible on the page
 * with "Game Over" text, Play Again button, and Home button.
 * @param {import('@playwright/test').Page} page
 */
async function expectGameOverOverlay(page) {
  const overlay = page.locator('santa-overlay');
  await expect(overlay).toBeVisible({ timeout: 10000 });

  // Assert "Game Over" header text in hero container
  const heading = overlay.locator('.hero h1');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText(/game\s*over/i);

  // Assert Play Again button is visible
  const playAgainBtn = overlay.locator('#playagainButton');
  await expect(playAgainBtn).toBeVisible();

  // Assert Home button is visible
  const homeBtn = overlay.locator('santa-button[data-action="home"]');
  await expect(homeBtn).toBeVisible();
}

/**
 * Creates helpers for testing a scene hosted at `/<scene>.html`.
 *
 * Usage:
 *   const runner = sceneHelpers('runner', '#module-runner');
 *   test.beforeEach(({ page, baseURL }) => runner.load(page, baseURL));
 *   await runner.advanceTime(page, 1.5);
 *   await expect(runner.frame(page).locator('.score')).toHaveText('10');
 *
 * These helpers do not depend on the Playwright test runner, so they can also
 * be used by the tools in `tests/tools/`.
 *
 * @param {string} scene Scene name, e.g. 'runner'. The scene iframe is located
 *     with `iframe[src*="scenes/<scene>"]`.
 * @param {string} moduleSelector Selector for the scene's root element inside
 *     the iframe, e.g. '#module-runner'.
 */
function sceneHelpers(scene, moduleSelector) {
  const iframeSelector = `iframe[src*="scenes/${scene}"]`;

  /**
   * The scene iframe element in the host page (e.g. to focus it before
   * sending keyboard input).
   * @param {import('@playwright/test').Page} page
   */
  function iframe(page) {
    return page.locator(iframeSelector);
  }

  /**
   * FrameLocator for content inside the scene iframe.
   * @param {import('@playwright/test').Page} page
   */
  function frame(page) {
    return page.frameLocator(iframeSelector);
  }

  /**
   * Locator for the scene's root element inside the iframe.
   * @param {import('@playwright/test').Page} page
   */
  function gameElem(page) {
    return frame(page).locator(moduleSelector);
  }

  /** @type {!WeakMap<!import('@playwright/test').Page, !import('@playwright/test').Frame>} */
  const contentFrames = new WeakMap();

  /**
   * The scene iframe's Frame. Use `(await contentFrame(page)).evaluate(...)`
   * to run code in the scene: it is much faster than evaluating through a
   * frame locator, which re-resolves the frame on every call.
   * @param {import('@playwright/test').Page} page
   * @return {!Promise<!import('@playwright/test').Frame>}
   */
  async function contentFrame(page) {
    let f = contentFrames.get(page);
    if (!f || f.isDetached()) {
      const handle = await iframe(page).elementHandle();
      f = await handle.contentFrame();
      await handle.dispose();
      if (!f) {
        throw new Error(`No content frame for ${iframeSelector}`);
      }
      contentFrames.set(page, f);
    }
    return f;
  }

  /**
   * Advances the scene's manual time by `seconds` via
   * `window.__TEST_CONTROL__.advanceTime`.
   *
   * By default this is a single `advanceTime(seconds)` call. With `step`, it
   * instead calls `advanceTime(step)` repeatedly (in one round trip), for
   * games whose simulation depends on how time is chunked, e.g. to replay
   * recorded per-frame inputs exactly.
   *
   * @param {import('@playwright/test').Page} page
   * @param {number} seconds
   * @param {{step?: number}=} options
   */
  async function advanceTime(page, seconds, options = {}) {
    const f = await contentFrame(page);
    await f.evaluate(({ secs, step }) => {
      if (!step) {
        window.__TEST_CONTROL__.advanceTime(secs);
        return;
      }
      const count = Math.round(secs / step);
      for (let i = 0; i < count; i++) {
        window.__TEST_CONTROL__.advanceTime(step);
      }
    }, { secs: seconds, step: options.step || 0 });
  }

  /**
   * Loads the hosted scene under manual time and a seeded PRNG, and waits until
   * `window.__TEST_CONTROL__.isReady()` returns true.
   *
   * - Sets `window.__MANUAL_TIME__ = true` and `window.__RANDOM_SEED__` in every
   *   frame before any page script runs, so randomness consumed while the
   *   scene is constructed is already seeded.
   * - Once ready, calls `Random.setSeed(seed)` again so every test starts from
   *   the same PRNG state regardless of how much randomness loading consumed.
   *   Scenes without randomness don't include `Random`; that's fine.
   *
   * @param {import('@playwright/test').Page} page
   * @param {string|undefined} baseURL
   * @param {{seed?: string, query?: string, timeout?: number}=} options
   *     `query` is appended to the host URL (e.g. '?level=3').
   */
  async function load(page, baseURL, options = {}) {
    const seed = options.seed || DEFAULT_SEED;
    const timeout = options.timeout || 90000;

    await page.addInitScript((seed) => {
      window.__MANUAL_TIME__ = true;
      window.__RANDOM_SEED__ = seed;
    }, seed);

    const base = baseURL || `http://localhost:${process.env.PORT || 8005}`;
    await page.goto(`${base}/${scene}.html${options.query || ''}`, {
      waitUntil: 'domcontentloaded',
    });

    await gameElem(page).waitFor({ state: 'attached', timeout });

    const f = await contentFrame(page);
    await f.evaluate(async ({ timeout }) => {
      const deadline = Date.now() + timeout;
      while (!(window.__TEST_CONTROL__ && window.__TEST_CONTROL__.isReady())) {
        if (Date.now() > deadline) {
          throw new Error(window.__TEST_CONTROL__ ?
              'window.__TEST_CONTROL__.isReady() never returned true' :
              'window.__TEST_CONTROL__ is not defined');
        }
        await new Promise((r) => setTimeout(r, 50));
      }
    }, { timeout });

    // Once the scene is ready, the host hides its interlude and sends the
    // scene its initial 'resume'/'unmuted' messages. Wait for that to happen,
    // so those messages can't arrive in the middle of a test (e.g. a late
    // 'resume' would unfreeze a game the test has already ended).
    await page.waitForFunction(() => {
      const interlude = document.querySelector('santa-interlude');
      return !interlude || !interlude.hasAttribute('active');
    }, null, { timeout });

    await f.evaluate(async ({ seed }) => {
      // Let the host's messages, which are already posted, be delivered.
      await new Promise((r) => setTimeout(r, 100));
      if (window.Random && window.Random.setSeed) {
        window.Random.setSeed(seed);
      }
    }, { seed });
  }

  return {
    scene,
    moduleSelector,
    iframeSelector,
    iframe,
    frame,
    gameElem,
    contentFrame,
    advanceTime,
    load,
  };
}

module.exports = {
  DEFAULT_SEED,
  expectGameOverOverlay,
  sceneHelpers,
};
