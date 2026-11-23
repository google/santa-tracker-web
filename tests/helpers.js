const { expect } = require('@playwright/test');

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

module.exports = {
  expectGameOverOverlay,
};
