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
- **Determinism as a Testing Superpower**: When a fixed seed is used, all procedural behaviors—such as level layouts, item spawns, card shuffles, target appearances, event sequences, and physics starting conditions—are completely reproducible across test runs. This enables tests to play and interact with the game naturally as a real user would, without needing artificial state manipulations or cheats.

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

### 3. Natural Gameplay Simulation (No Artificial State / Entity Injection)
- **CRITICAL ANTI-PATTERN**: Never artificially inject entities, force game states, or manually trigger internal game methods to satisfy a test (e.g. calling internal spawning/scoring functions, pushing objects directly into entity lists, or manually overriding position coordinates).
- **Test as a Real User**: Tests must interact with the game strictly from the outside, exactly as a human player would. Let the game engine run and spawn elements naturally, advance time to let gameplay progress, and use native user inputs (keystrokes, mouse clicks, drags) to play the game and trigger interactions.
- **Why Artificial Injection Fails**: Manually mutating internal game state bypasses the real event loops, game rules, physics engines, hitboxes, and state machines. Tests that take shortcuts often pass while masking critical user-facing bugs, broken controls, or regression failures in gameplay logic.

### 4. Observing Deterministic Game Behavior & Event Timing
- **Observe the Behavior of the Game**: Because the PRNG seed is fixed, every aspect of the game and timing is reproducible. The exact sequence of events—when an item appears, when a target becomes interactable, when a dialogue or tutorial completes, or when an obstacle enters view—happens at the exact same game-time across every test run.
- **Discovering Event Timestamps & Interaction Points**:
  - Rather than guessing or polling repeatedly in tests, observe the game flow to determine the exact game time or sequence needed to reach target game events or interaction opportunities.
  - Navigate through the game directly to the interaction point. For some games, this is done by just advancing time; other games will require a combination of input and advancing time to navigate to the correct moment:
    ```javascript
    // Advance time until the target interactable state or event occurs
    await advanceTime(page, 30.4);
    ```
- **Discovery Workflow**:
  - **Visual Observation**: Use Playwright UI Mode (`npx playwright test --ui`) or the `/browser` subagent to step through game time visually and identify when interaction opportunities occur.
  - **One-off Diagnostic Tracing**: During test authoring, temporarily log relevant state changes or timestamps (e.g. logging when an event triggers or inspecting state), identify the exact timestamp needed, and remove the diagnostic logging before finalizing the test.

### 5. Native User Interactions & Action Timing Beats
- **Do NOT** use synthetic JavaScript events (`window.dispatchEvent(new KeyboardEvent(...))`).
- Use Playwright's native input simulation on the target element or iframe:
  ```javascript
  const iframeElem = page.locator('iframe[src*="scenes/<game>"]');
  await iframeElem.focus();
  await page.keyboard.press('Space');
  ```
- **Structure Interaction Beats**:
  Regardless of the game genre (arcade, puzzle, rhythm, runner, etc.), structure interactions into distinct, logical gameplay beats:
  1. **Setup / Advance Beat**: Advance time in a consolidated step until the game reaches the exact state or moment required for the action (e.g., an element appears, a round starts, or a piece reaches an interactable position).
  2. **Input Beat**: Focus the game context and perform the native player input (`page.keyboard.press(...)`, `page.mouse.click(...)`, drag-and-drop gestures, etc.).
     - For compound actions (e.g. a double jump, combination keypresses, or sequenced clicks), space out the inputs with realistic intermediate `advanceTime` delays matching game mechanics:
       ```javascript
       await page.keyboard.press('Space');
       await advanceTime(page, 0.3); // Wait for apex, animation beat, or cooldown
       await page.keyboard.press('Space'); // Follow-up action
       ```
  3. **Resolution Beat**: Advance time enough for the game logic, physics, animations, or state transitions triggered by the input to resolve completely.
  4. **Assertion Beat**: Validate the user-visible consequences of the action through DOM elements (e.g. score displays, status badges, element classes, feedback animations, or level progress).

### 6. Negative Mutation Testing (Input Necessity Verification)
- When writing tests where a player action is required (e.g., jumping to collect an item, steering around a hazard, clicking a matching tile, or pressing a key in time):
  - **Adversarially verify that the input is necessary**: Temporarily remove or alter the user action (e.g., omit the keypress or click) and confirm that the test **fails** (i.e. the item is not collected, the hazard is hit, or the level does not advance).
  - This prevents false-positive tests that pass trivially due to passive hitboxes, default auto-advancements, or unintended fall-through states.

### 7. Shared Game Over Screen Assertions
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

### 8. Debugging & Iteration Workflow
- **Browser Skill First**: For complicated tests or scenes, iterate by using the `/browser` skill to inspect the live page and DOM state visually and interactively. Use seeded random & manual time control so the browser state matches the test state.
- **Playwright UI Mode**: Running tests with `npx playwright test --ui` allows step-by-step time scrubbing, DOM snapshot inspection, and interactive locator testing.
- **Logging & Filtered Test Runs**: Adding console logging is a secondary option to obtain more information about the game and game state because it is slower. When running tests to inspect logs, run in a filtered manner (`npx playwright test tests/<game>.spec.js -g "test title"`) to execute only the minimal required tests.
- **Consolidated Time Advancements**: In test cases, use consolidated `advanceTime(page, duration)` calls rather than calling `advanceTime` multiple times sequentially, except when separating distinct user input beats (e.g. setup, input delay, resolution).
- **Final Validation**: Run all tests in the impacted test file(s) (`npx playwright test tests/<game>.spec.js`).
