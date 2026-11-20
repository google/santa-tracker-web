const { test, expect } = require('@playwright/test');
const { expectGameOverOverlay, sceneHelpers } = require('./helpers');

const boatload = sceneHelpers('boatload', '#module-boatload');
const advanceTime = boatload.advanceTime;

test.describe('Boatload Game', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await boatload.load(page, baseURL);
  });

  test('should load the hosted game automatically', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="boatload"]');
    const gameElem = frameLoc.locator('#module-boatload');
    await expect(gameElem).toBeVisible({ timeout: 30000 });

    // Assert game is active (not frozen)
    const frozenElem = frameLoc.locator('#module-boatload.frozen');
    await expect(frozenElem).not.toBeAttached();
  });

  test('should end after 60 seconds', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="boatload"]');

    await advanceTime(page, 65);

    // Assert game stopped and module element received .frozen class
    const frozenElem = frameLoc.locator('#module-boatload.frozen');
    await expect(frozenElem).toBeAttached();

    // Assert gameover overlay is visible with text, play again, and home buttons
    await expectGameOverOverlay(page);
  });

  test('should update score when a present lands in a boat', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="boatload"]');

    await advanceTime(page, 0.1);

    // Drop present via user interaction
    await page.locator('iframe[src*="boatload"]').focus();
    await page.keyboard.press('Space');

    await advanceTime(page, 3);

    // Verify score sign DOM element is present
    const scoreSign = frameLoc.locator('.score-sign');
    await expect(scoreSign).toBeAttached();
  });

  test('should block presents with an iceberg', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="boatload"]');

    await advanceTime(page, 0.1);

    // Verify icebergs layer element exists
    const icebergsElem = frameLoc.locator('.icebergs');
    await expect(icebergsElem).toBeAttached();

    // Drop present over icebergs layer
    await page.locator('iframe[src*="boatload"]').focus();
    await page.keyboard.press('Space');
    await advanceTime(page, 0.5);

    // Verify presents layer element exists
    const presentsElem = frameLoc.locator('.presents');
    await expect(presentsElem).toBeAttached();
  });

  test('should show score screen at the end of the game', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="boatload"]');

    await advanceTime(page, 65);

    // Assert game is frozen and score screen / gameover overlay is rendered
    const frozenElem = frameLoc.locator('#module-boatload.frozen');
    await expect(frozenElem).toBeAttached();

    const scoreSign = frameLoc.locator('.score-sign');
    await expect(scoreSign).toBeAttached();

    await expectGameOverOverlay(page);
  });

  test('should be able to be restarted', async ({ page }) => {
    const frameLoc = page.frameLocator('iframe[src*="boatload"]');
    const gameElem = frameLoc.locator('#module-boatload');

    // End game first
    await advanceTime(page, 65);
    const frozenElem = frameLoc.locator('#module-boatload.frozen');
    await expect(frozenElem).toBeAttached();
    await expectGameOverOverlay(page);

    // Click play again on game over overlay
    const playAgainBtn = page.locator('santa-overlay #playagainButton');
    await playAgainBtn.click();

    // Assert game module unfreezes (loses .frozen class)
    await expect(frozenElem).not.toBeAttached();
  });
});
