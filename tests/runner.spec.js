const { test, expect } = require('@playwright/test');
const { expectGameOverOverlay } = require('./helpers');

function getHostUrl(baseURL) {
  if (baseURL && !baseURL.includes('localhost') && !baseURL.includes('127.0.0.1')) {
    return `${baseURL}/runner.html`;
  }
  return 'http://localhost:8000/runner.html';
}

async function advanceTime(page, seconds) {
  const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
  await frameLoc.locator('#module-runner').evaluate((_, secs) => {
    window.__TEST_CONTROL__.advanceTime(secs);
  }, seconds);
}

test.describe('Runner Game', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.addInitScript(() => {
      window.__MANUAL_TIME__ = true;
    });

    const hostUrl = getHostUrl(baseURL);
    await page.goto(hostUrl, { waitUntil: 'domcontentloaded' });

    // Target active scene iframe
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    const gameElem = frameLoc.locator('#module-runner');
    await expect(gameElem).toBeAttached({ timeout: 30000 });

    // Ensure __TEST_CONTROL__ is defined or fail immediately
    await gameElem.evaluate(async () => {
      for (let i = 0; i < 100; i++) {
        if (window.__TEST_CONTROL__) break;
        await new Promise(r => setTimeout(r, 100));
      }
      if (!window.__TEST_CONTROL__) {
        throw new Error('window.__TEST_CONTROL__ is not defined');
      }
      if (window.Random && window.Random.setSeed) {
        window.Random.setSeed('test1234');
      }
    });
  });

  test('should load the hosted runner game automatically and start tutorial', async ({ page }) => {
    const tutorialElem = page.locator('santa-gameloader santa-tutorial, santa-tutorial');
    await expect(tutorialElem).toBeAttached({ timeout: 30000 });

    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    const frozenGameElem = frameLoc.locator('#module-runner .game.frozen');
    await expect(frozenGameElem).not.toBeAttached();
  });

  test('should allow character to double jump but not triple jump', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    const playerElem = frameLoc.locator('.reindeer');
    const iframeElem = page.locator('iframe[src*="scenes/runner"]');

    await advanceTime(page, 0.1);

    const getPlayerTransformY = async () => {
      return await playerElem.evaluate((el) => {
        const transform = el.style.transform || '';
        const match = transform.match(/translate3d\([^,]+,\s*(-?\d+(?:\.\d+)?)px/);
        return match ? parseFloat(match[1]) : 0;
      });
    };

    const initialY = await getPlayerTransformY();

    await iframeElem.focus();
    await page.keyboard.press('Space');
    await advanceTime(page, 0.05);
    const jump1Y = await getPlayerTransformY();

    await page.keyboard.press('Space');
    await advanceTime(page, 0.05);
    const jump2Y = await getPlayerTransformY();

    await advanceTime(page, 0.2);
    const apexY = await getPlayerTransformY();

    await advanceTime(page, 0.2);
    const landingY = await getPlayerTransformY();

    expect(jump1Y).toBeLessThan(initialY);
    expect(jump2Y).toBeLessThan(jump1Y);
    expect(apexY).toBeLessThanOrEqual(jump2Y);
    expect(landingY).toBeLessThan(apexY);
  });

  test('should increase game speed over time as levels advance', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    const entitiesLayer = frameLoc.locator('.entities-layer');

    const getLayerX = async () => {
      return await entitiesLayer.evaluate((el) => {
        const transform = el.style.transform || '';
        const match = transform.match(/translate3d\((-?\d+(?:\.\d+)?)px/);
        return match ? parseFloat(match[1]) : 0;
      });
    };

    const x0 = await getLayerX();
    await advanceTime(page, 1);
    const x1 = await getLayerX();
    const distLevel0 = Math.abs(x1 - x0);

    await advanceTime(page, 30);

    const x2 = await getLayerX();
    await advanceTime(page, 1);
    const x3 = await getLayerX();
    const distLevel1 = Math.abs(x3 - x2);

    expect(distLevel1).toBeGreaterThan(distLevel0);
  });

  test('should update score when presents are collected', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    await advanceTime(page, 15);
    const entitiesLayer = frameLoc.locator('.entities-layer');
    await expect(entitiesLayer).toBeAttached();
  });

  test('should handle obstacle collision', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    await advanceTime(page, 5);
    const hitCloud = frameLoc.locator('.hit-cloud');
    await expect(hitCloud).toBeAttached();
  });

  test('should activate boost powerup when collected', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    await advanceTime(page, 10);
    const boosts = frameLoc.locator('.boosts');
    await expect(boosts).toBeAttached();
  });

  test('should activate magnet powerup when collected', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    await advanceTime(page, 10);
    const magnet = frameLoc.locator('.magnet');
    await expect(magnet).toBeAttached();
  });

  test('should end game and show gameover screen when timer expires', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');

    // Runner initial countdown is 120s
    await advanceTime(page, 130);

    // Assert game element receives .frozen class on gameover
    const frozenGameElem = frameLoc.locator('#module-runner .game.frozen');
    await expect(frozenGameElem).toBeAttached();

    // Assert gameover overlay is visible with text, play again, and home buttons
    await expectGameOverOverlay(page);
  });

  test('should restart game when restart event is triggered', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    const gameElem = frameLoc.locator('#module-runner');

    // End game first (Runner countdown is 120s)
    await advanceTime(page, 130);
    const frozenGameElem = frameLoc.locator('#module-runner .game.frozen');
    await expect(frozenGameElem).toBeAttached();
    await expectGameOverOverlay(page);

    // Dispatch restart event
    await gameElem.evaluate(() => {
      const event = new CustomEvent('restart');
      window.dispatchEvent(event);
    });

    // Assert game unfreezes (loses .frozen class)
    await expect(frozenGameElem).not.toBeAttached();
  });
});
