const { test, expect } = require('@playwright/test');
const { expectGameOverOverlay } = require('./helpers');

function getHostUrl(baseURL) {
  return `${baseURL || 'http://localhost:8000'}/runner.html`;
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

    // Ensure __TEST_CONTROL__ is defined and ready or fail immediately
    await gameElem.evaluate(async () => {
      for (let i = 0; i < 300; i++) {
        if (window.__TEST_CONTROL__ && window.__TEST_CONTROL__.isReady()) break;
        await new Promise(r => setTimeout(r, 100));
      }
      if (!window.__TEST_CONTROL__) {
        throw new Error('window.__TEST_CONTROL__ is not defined');
      }
      if (!window.Random || !window.Random.setSeed) {
        throw new Error('window.Random.setSeed is not defined');
      }
      window.Random.setSeed('test1234');
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
    expect(initialY).toBe(0);

    await iframeElem.focus();

    // 1st Jump: Player jumps off the ground
    await page.keyboard.press('Space');
    await advanceTime(page, 0.1);
    const jump1Y = await getPlayerTransformY();
    expect(jump1Y).toBeLessThan(initialY);

    // 2nd Jump (Double jump): Player jumps again mid-air and gains height
    await page.keyboard.press('Space');
    await advanceTime(page, 0.1);
    const jump2Y = await getPlayerTransformY();
    expect(jump2Y).toBeLessThan(jump1Y);

    // Let the player reach apex and begin descending
    await advanceTime(page, 0.6);
    const midAirFallingY = await getPlayerTransformY();
    expect(midAirFallingY).toBeLessThan(0); // still in mid-air

    // 3rd Jump attempt (Triple jump): Press Space a third time while still mid-air
    await page.keyboard.press('Space');
    await advanceTime(page, 0.1);
    const postTripleJumpY = await getPlayerTransformY();

    // Triple jump is NOT permitted, so the player must continue falling downward (y increases toward 0)
    // rather than jumping upwards (which would make y more negative than midAirFallingY)
    expect(postTripleJumpY).toBeGreaterThan(midAirFallingY);
    expect(postTripleJumpY).toBeLessThan(0);

    // Advance time until the player lands back on the ground
    await advanceTime(page, 0.5);
    const landedY = await getPlayerTransformY();
    expect(landedY).toBe(0);

    // Once grounded, jump counter resets and jumping is permitted again
    await page.keyboard.press('Space');
    await advanceTime(page, 0.1);
    const postLandingJumpY = await getPlayerTransformY();
    expect(postLandingJumpY).toBeLessThan(0);
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
    const gameElem = frameLoc.locator('#module-runner');

    // Score is initially 0 and no presents have been collected yet
    const initialScore = await gameElem.evaluate(() => {
      return window.__TEST_CONTROL__.game.scoreboard.score;
    });
    expect(initialScore).toBe(0);

    const collectedPresents = frameLoc.locator('.present--collected');
    await expect(collectedPresents).not.toBeAttached();

    // Advance time so the player runs into and collects presents along the track
    await advanceTime(page, 15);

    // Assert that presents have been collected in the scene
    await expect(collectedPresents.first()).toBeAttached();
    const count = await collectedPresents.count();
    expect(count).toBeGreaterThan(0);

    // Assert that scoreboard score within runner game updated
    const finalScore = await gameElem.evaluate(() => {
      return window.__TEST_CONTROL__.game.scoreboard.score;
    });
    expect(finalScore).toBeGreaterThan(initialScore);

    // Assert that the score badge on the main page is updated with the new score
    const badgeScore = await page.locator('santa-badge').evaluate((el) => el.score);
    expect(badgeScore).toBe(finalScore);
  });

  test('should handle obstacle collision', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    const gameElem = frameLoc.locator('#module-runner');
    const reindeerElem = frameLoc.locator('.reindeer');
    const hitCloudElem = frameLoc.locator('.hit-cloud');

    // Initially, reindeer is running normally and hit-cloud is hidden
    await expect(reindeerElem).toHaveClass(/reindeer--run/);
    await expect(reindeerElem).not.toHaveClass(/reindeer--collision/);
    await expect(hitCloudElem).toHaveClass(/hidden/);

    // At t=4s (with seed 'test1234'), the reindeer collides with an obstacle
    await advanceTime(page, 4);

    // Assert reindeer enters collision state and hit cloud is activated
    await expect(reindeerElem).toHaveClass(/reindeer--collision/);
    await expect(hitCloudElem).not.toHaveClass(/hidden/);
    await expect(frameLoc.locator('.hit-cloud__inner--active')).toBeAttached();

    const isCollisionState = await gameElem.evaluate(() => {
      // REINDEER_STATE_COLLISION = 3
      return window.__TEST_CONTROL__.game.player.state === 3;
    });
    expect(isCollisionState).toBe(true);

    // After collision duration (2s), reindeer recovers and returns to running state
    await advanceTime(page, 2.5);
    await expect(reindeerElem).toHaveClass(/reindeer--run/);
    await expect(reindeerElem).not.toHaveClass(/reindeer--collision/);
    await expect(hitCloudElem).toHaveClass(/hidden/);
  });

  test('should activate boost powerup when collected', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    const gameElem = frameLoc.locator('#module-runner');
    const iframeElem = page.locator('iframe[src*="scenes/runner"]');

    // Initially no boosts have been collected
    const collectedBoost = frameLoc.locator('.boost--collected');
    await expect(collectedBoost).not.toBeAttached();

    // Advance time towards naturally spawned time boost (at x=30278, y=-244)
    await advanceTime(page, 69.0);

    const initialCountdown = await gameElem.evaluate(() => {
      return window.__TEST_CONTROL__.game.scoreboard.countdown;
    });

    // Jump using native keyboard input to collect the time boost
    await iframeElem.focus();
    await page.keyboard.press('Space');
    await advanceTime(page, 1.5);

    // Assert that the boost is marked collected in the DOM
    await expect(collectedBoost.first()).toBeAttached();

    // Assert that the time boost added 10 seconds to the countdown
    const newCountdown = await gameElem.evaluate(() => {
      return window.__TEST_CONTROL__.game.scoreboard.countdown;
    });
    // With 1.5 seconds of game time elapsed and +10s boost added, newCountdown > initialCountdown
    expect(newCountdown).toBeGreaterThan(initialCountdown);
  });

  test('should activate magnet powerup when collected', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="scenes/runner"]');
    const gameElem = frameLoc.locator('#module-runner');
    const magnetElem = frameLoc.locator('.magnet');
    const iframeElem = page.locator('iframe[src*="scenes/runner"]');

    // Initially magnet powerup is not active
    await expect(magnetElem).not.toHaveClass(/magnet--active/);
    const initialMagnetMode = await gameElem.evaluate(() => window.__TEST_CONTROL__.game.magnetMode);
    expect(initialMagnetMode).toBe(false);

    // Advance time towards naturally spawned magnet boost (at x=11778, y=-589)
    await advanceTime(page, 30.4);

    // Perform double jump using native keyboard input to collect the high-altitude magnet boost
    await iframeElem.focus();
    await page.keyboard.press('Space');
    await advanceTime(page, 0.3);
    await page.keyboard.press('Space');
    await advanceTime(page, 0.8);

    // Assert magnet powerup activated in the UI and game state
    await expect(magnetElem).toHaveClass(/magnet--active/);
    const magnetModeActive = await gameElem.evaluate(() => window.__TEST_CONTROL__.game.magnetMode);
    expect(magnetModeActive).toBe(true);

    // Advance time past the magnet duration (20s) and assert it deactivates
    await advanceTime(page, 21);
    await expect(magnetElem).not.toHaveClass(/magnet--active/);
    const magnetModeEnded = await gameElem.evaluate(() => window.__TEST_CONTROL__.game.magnetMode);
    expect(magnetModeEnded).toBe(false);
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

    // Click play again on game over overlay
    const playAgainBtn = page.locator('santa-overlay #playagainButton');
    await playAgainBtn.click();

    // Assert game unfreezes (loses .frozen class)
    await expect(frozenGameElem).not.toBeAttached();
  });
});
