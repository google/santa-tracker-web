# Santa Tracker Web: Game E2E Testing Instructions

This document provides mandatory standards, architecture rules, and step-by-step instructions for AI agents and software engineers implementing E2E tests for Santa Tracker games.

---

## Part 1: Modifying the Game for Determinism & Testability

Before writing tests, inspect the game's source code and modify it as necessary to ensure complete determinism and test control.

### 1. Manual Time Control (`__MANUAL_TIME__` & `__TEST_CONTROL__`)

**CRITICAL REQUIREMENT**: All timing-related logic in the game **must be completely controllable** when running under manual time mode. This encompasses:
- Animation loops normally driven by `requestAnimationFrame` (rAF).
- Delays, intervals, and timers normally driven by `setTimeout` and `setInterval` (including custom game `Timer` utility wrappers).
- Countdown timers, spawn delays, level transitions, and any other timing components.
- CSS animations or CSS transitions that are core to the gameplay logic must also be controllable. These will likely have animationend or transitionend listeners that control something about the game. Purely visual animations do not need to be controllable.

When `window.__MANUAL_TIME__` is set, the game must disable or pause independent wall-clock loops so that **all** game state progression, timers, and frame updates advance strictly and exclusively when invoked via `window.__TEST_CONTROL__.advanceTime(seconds)`.

- Expose **only** two global test control variables on `window`:
  1. `window.__MANUAL_TIME__ = true;`
  2. `window.__TEST_CONTROL__ = { advanceTime(seconds) }`

- **Uniform `advanceTime` Interface**:
  - `advanceTime(seconds)` must take a single parameter `seconds` (number of seconds to advance).
  - **Implementation Strategy (Game Logic Dependent)**:
    - Examine the game logic to choose the step strategy that realistically simulates the game without breaking physics, collision detection, or timer callbacks:
      - **Realistic FPS Stepping**: Games with fine-grained physics or frame-dependent calculations (e.g., *Boatload*) must step forward at a realistic frame rate (e.g., 60 FPS with `1/60`s step size).
      - **Large Step Granularity**: Games whose logic handles arbitrary delta step sizes without physics clipping (e.g., *Runner*) may step forward in larger increments capped up to 1 second (`maxStepSize = 1`).
    - The loop must step while remaining time > 0 and the game is active (`while (remaining > 0 && this.isPlaying)`).

```javascript
/**
 * Advances manual time by duration seconds.
 * @param {number} duration
 */
app.Game.prototype.advanceTime = function(duration) {
  var maxStepSize = 1;
  var remaining = duration;
  while (remaining > 0 && this.isPlaying) {
    var dt = Math.min(maxStepSize, remaining);
    this.step(dt);
    remaining -= dt;
  }
};
```

### 2. Seeded Randomness & Deterministic PRNG
- Replace unseeded `Math.random()` with the shared Closure PRNG module [`static/scenes/_shared/js/random.js`](../static/scenes/_shared/js/random.js) (`goog.provide('Random')`).
- Do **NOT** write duplicative PRNG functions in individual scene files.
- Seed the PRNG during test initialization (`window.Random.setSeed('test1234')`).

### 3. Removing Non-Determinism
- Replace real wall-clock timeouts or asynchronous `Date.now()` timers that bypass manual step loops with manual-time-compatible timer controls.
- Ensure all animations, spawns, and state progressions advance strictly via manual time stepping.

### 4. Simulating External APIs & Dependencies
- If a game relies on external network requests or APIs (e.g., backend services, high scores, remote config), create a version or fixture that fakes or simulates the API responses deterministically during testing.

---

## Part 2: Test Writing

### 1. Feature Enumeration
- Before writing tests, inspect the game features and list all test cases (e.g., automatic loading, tutorial display, controls/jumping, level advancement/speed increase, item pickup, collisions, timer expiration, gameover screen, restart).

### 2. User-Centric Validation (HTML DOM vs Canvas)
- **Primary Rule**: Always validate game behavior from the user's perspective by checking user-visible DOM elements, CSS styles, transforms (`translate3d`), and host UI.
- **HTML DOM Games**:
  - Must interact with the page as a user would and validate strictly using HTML DOM elements.
  - Do **NOT** expose internal game objects (e.g. `window.game`) or internal state getters to `window`.
- **Canvas & Game Engine Games**:
  - **IF AND ONLY IF** a game renders directly to a `<canvas>` or uses a game engine (such as Three.js) where in-game entities are not accessible in the DOM, you are permitted to expose minimal test control hooks on `window.__TEST_CONTROL__`.
  - Exposed elements must align with how a user interacts with the game and minimize exposure of internal details.
  - **Favor HTML UI Assertions**: Even for canvas-based games, any feature rendering via HTML DOM (such as `.score-sign`, tutorial `<santa-tutorial>`, or host overlay `<santa-overlay>`) **must** be asserted using HTML DOM elements.

### 3. Shared Game Over Screen Assertions
- Verify the gameover screen using the shared helper `expectGameOverOverlay(page)` from [`tests/helpers.js`](./helpers.js):

```javascript
const { expect } = require('@playwright/test');

/**
 * Asserts that the santa-overlay game over screen is visible on the page
 * with "Game Over" text, Play Again button, and Home button.
 * @param {import('@playwright/test').Page} page
 */
async function expectGameOverOverlay(page) {
  const overlay = page.locator('santa-overlay');
  await expect(overlay).toBeVisible({ timeout: 10000 });

  // Assert "Game Over" header text in hero element (scoped to avoid card link h1s)
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
```

### 4. Native User Interactions
- **Do NOT** use synthetic JavaScript events (`window.dispatchEvent(new KeyboardEvent(...))`).
- Use Playwright's native input simulation:
  ```javascript
  const iframeElem = page.locator('iframe[src*="scenes/<game>"]');
  await iframeElem.focus();
  await page.keyboard.press('Space');
  ```

### 5. Debugging & Iteration Workflow
- **Browser Skill First**: For complicated tests or scenes, iterate by using the `/browser` skill to inspect the live page and DOM state visually and interactively. Use seeded random & manual time control so the browser state matches the test state.
- **Logging & Filtered Test Runs**: Adding console logging is a secondary option to obtain more information about the game and game state because it is slower. When running tests to inspect logs, run in a filtered manner (`npx playwright test tests/<game>.spec.js -g "test title"`) to execute only the minimal required tests.
- **Consolidated Time Advancements**: In test cases, use single consolidated `advanceTime(page, duration)` calls rather than calling `advanceTime` multiple times sequentially.
- **Final Validation**: Run all tests in the impacted test file(s) (`npx playwright test tests/<game>.spec.js`).
