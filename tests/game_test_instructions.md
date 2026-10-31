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
  1. `window.__MANUAL_TIME__ = true;` (set by the test before the page loads)
  2. `window.__TEST_CONTROL__ = { advanceTime(seconds), isReady() }`, created in the scene's `index.html` only when `window.__MANUAL_TIME__` is set. `isReady` returns `!!window.__SCENE_READY__`, which the scene sets to `true` at the end of its `api.ready(...)` callback (see `static/scenes/boatload/index.html`).
- Tests may additionally set `window.__RANDOM_SEED__` (see §2); scenes don't need to read it.

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
- Replace unseeded `Math.random()` with the shared PRNG module [`static/scenes/_shared/js/random.js`](../static/scenes/_shared/js/random.js) (`goog.provide('Random')` in Closure scenes, or `<script src="../_shared/js/random.js"></script>` + `window.Random.random()` in pure ES-module scenes).
- Do **NOT** write duplicative PRNG functions in individual scene files, and do **NOT** globally override `Math.random`.
- Seeding is handled by the shared `load()` test helper (Part 2 §0): it sets `window.__RANDOM_SEED__` before any page script runs (so randomness consumed while the scene is constructed is seeded), then calls `window.Random.setSeed('test1234')` once the scene is ready. Scenes with no randomness at all don't need to include `Random`; the helper only seeds it when it's present.
- **Determinism as a Testing Superpower**: When a fixed seed is used, all procedural behaviors—such as level layouts, item spawns, card shuffles, target appearances, event sequences, and physics starting conditions—are completely reproducible across test runs. This enables tests to play and interact with the game naturally as a real user would, without needing artificial state manipulations or cheats.

### 3. Removing Non-Determinism
- Replace real wall-clock timeouts or asynchronous `Date.now()` timers that bypass manual step loops with manual-time-compatible timer controls (e.g. the scene's existing `Coordinator`, a Phaser timer, or a countdown advanced in the step loop). This includes death/respawn delays and level transitions.
- Ensure all animations, spawns, and state progressions advance strictly via manual time stepping.
- **Shared level up banner** (`app.shared.LevelUp` / `LevelUp` from `static/scenes/_shared/js/levelup.js`): under manual time, call `this.levelUp.enableManualTime()` once and `this.levelUp.onFrame(dt)` from every step of the game's `advanceTime` loop. The banner callback then fires after a fixed amount of game time instead of waiting for CSS events. Do not reimplement or bypass the banner.
- Don't change production behavior (e.g. rewrite a restart path) to make testing easier. Keep manual-time-only code paths behind `window.__MANUAL_TIME__`, and put genuine bug fixes found while testing in their own change.

### 4. Simulating External APIs & Dependencies
- If a game relies on external network requests or APIs (e.g., backend services, high scores, remote config), create a version or fixture that fakes or simulates the API responses deterministically during testing.

---

## Part 2: Test Writing

### 0. Shared Test Helpers (required)
Use [`tests/helpers.js`](./helpers.js) instead of writing per-file boilerplate (see `tests/boatload.spec.js`):
```javascript
const { test, expect } = require('@playwright/test');
const { expectGameOverOverlay, sceneHelpers } = require('./helpers');

const game = sceneHelpers('<scene>', '#module-<scene>');

test.beforeEach(async ({ page, baseURL }) => {
  await game.load(page, baseURL);  // manual time, seeded PRNG, waits for isReady()
});

test('...', async ({ page }) => {
  await game.iframe(page).focus();           // host <iframe> element, for native input
  await page.keyboard.press('Space');
  await game.advanceTime(page, 0.5);
  await expect(game.frame(page).locator('.score')).toHaveText('10');  // inside the scene
});
```
- To run code inside the scene, use `(await game.contentFrame(page)).evaluate(...)`. It is much faster than `game.gameElem(page).evaluate(...)`, which matters when a test makes hundreds of calls.
- `game.advanceTime(page, secs, {step: 1/60})` advances in fixed steps within one round trip. Use it when a game's simulation depends on how time is chunked (e.g. replaying recorded per-frame inputs).
- `load()` also waits for the host page to finish loading the scene, so the host's initial messages (e.g. `resume`) can't arrive mid-test.
- Don't monkeypatch `customElements.define`, `santa-gameloader`, or the service worker. The loader already allows a longer timeout under `__MANUAL_TIME__`, and `playwright.config.js` blocks service workers.
- Don't forward all browser console output or add debugging `console.log`s to committed tests or game code.

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
  await game.iframe(page).focus();
  await page.keyboard.press('Space');
  ```
- This includes clicks: use `locator.click()` / `page.mouse`, not `locator.dispatchEvent('click')`, and don't trigger the game's own event system (e.g. `jQuery(window).trigger(...)`).
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
- Verify the gameover screen using the shared helper `expectGameOverOverlay(page)` from [`tests/helpers.js`](./helpers.js).
- Where the game supports it, also test restarting from the overlay (click `santa-overlay #playagainButton` and assert the game unfreezes and is back in its initial state).

### 8. Debugging & Iteration Workflow
- **Browser Skill First**: For complicated tests or scenes, iterate by using the `/browser` skill to inspect the live page and DOM state visually and interactively. Use seeded random & manual time control so the browser state matches the test state.
- **Playwright UI Mode**: Running tests with `npx playwright test --ui` allows step-by-step time scrubbing, DOM snapshot inspection, and interactive locator testing.
- **Logging & Filtered Test Runs**: Adding console logging is a secondary option to obtain more information about the game and game state because it is slower. When running tests to inspect logs, run in a filtered manner (`npx playwright test tests/<game>.spec.js -g "test title"`) to execute only the minimal required tests.
- **Consolidated Time Advancements**: In test cases, use consolidated `advanceTime(page, duration)` calls rather than calling `advanceTime` multiple times sequentially, except when separating distinct user input beats (e.g. setup, input delay, resolution).
- **Final Validation**: Run all tests in the impacted test file(s) (`npx playwright test tests/<game>.spec.js`).

---

## Part 3: Files, Tooling & Repository Hygiene

- **File layout**:
  - Tests: `tests/<scene>.spec.js`. If a scene needs more than one spec file, prefix them all with the scene name (e.g. `tests/<scene>_playthrough.spec.js`).
  - Recorded input fixtures: `tests/fixtures/<scene>_inputs.json`.
  - Playthrough video recorders: `tests/tools/record_<scene>.js`, built on the shared [`tests/tools/recorder.js`](./tools/recorder.js) (`runRecording(...)`). Don't copy the server/ffmpeg/capture plumbing. Videos go to `videos/` (git-ignored).
- **Don't commit scratch work**: no analysis/debug scripts, JSON dumps, screenshots, planning docs (e.g. `PROJECT.md`) or exploratory "stress"/"investigation" spec files. Keep only tests that assert real game behavior.
- **No absolute or machine-specific paths** (home directories, agent artifact directories, etc.) in tests or tools.
- **Don't edit shared config for one scene**: leave `playwright.config.js`, `.gitignore`, `build/` and `static/src/` alone. Use `test.setTimeout(...)` for long tests. If a shared change really is needed, call it out separately.
- **Running tests in a worktree**: many worktrees run at once and the config reuses an already running dev server, so always pick a port unique to your worktree, e.g. `PORT=8100 npx playwright test tests/<scene>.spec.js`. Note that `serve.js` binds **both** `PORT` (prod host) and `PORT + 80` (static assets) on `127.0.0.1` — space ports across parallel worktrees (e.g. multiples of 100: `8100`, `8200`, `8300`, ...) so neither `PORT` nor `PORT + 80` collides, and never pass `--all` (`0.0.0.0`). The same `PORT` (or `--port <port>`) is used by the recorders.
- **Worktree setup**: symlink `node_modules` from the main checkout (`ln -s ../../santa-tracker-web/node_modules node_modules`). It is git-ignored; don't commit it.
