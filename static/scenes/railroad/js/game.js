// Entry point for the railroad game itself. This sets up the main loop of the game.

goog.provide('app.Game');

goog.require('app.Scene');
goog.require('app.Present');
goog.require('app.Constants');
goog.require('app.Level');
goog.require('app.shared.Scoreboard');
goog.require('app.shared.Gameover');

/**
 * Maximum time allowed between updates. If the player's computer was locked or
 * the window was inactive, we could potentially have a very large delta between
 * frames. This keeps the game somewhat paused when the user is inactive.
 */
const maxTimeStep = 0.5;

class Game {

  constructor() {
    this.paused = false;

    this.scoreboard = new app.shared.Scoreboard(this, null, app.Constants.LEVEL_COUNT);
    this.gameoverView = new app.shared.Gameover(this);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    this.level = undefined;

    this.previousSeconds = Date.now() / 1000;

    // Previous clicks, used to guess if the user is using an accessibilty tool.
    /** @type {Array<MouseEvent>} */
    this.previousClicks = []
  }

  /**
   * Initializes everything that stays across runs of the game, such as the
   * renderer and resize event listeners.
   *
   * For the moment this initializes a placeholder scene, but eventually that
   * logic should be put somewhere else to allow levels to be restarted without
   * needing to re-create the renderer.
   *
   * @param {HTMLElement} container The element that hosts the rendering for the
   * game.
   */
  async start(containerButton) {
    this.containerButton = containerButton;
    containerButton.appendChild(this.renderer.domElement);

    await Promise.all([
      app.Scene.preload(),
      app.Present.preload(),
    ]);

    this.setUpListeners(containerButton);
    this.mainLoop();

    this.startLevel();
  }

  startLevel() {
    if (this.level) {
      this.level.cleanUp();
    }
    this.level = new Level(this.renderer, this.scoreboard);

    window.santaApp.fire('sound-trigger', 'bl_game_start');
    window.santaApp.fire('sound-ambient', 'music_start_ingame');
    window.santaApp.fire('analytics-track-game-start', {gameid: 'railroad'});
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (!this.paused) {
      return;
    }
    this.paused = false;
    this.previousSeconds = Date.now() / 1000;
  }

  async restart() {
    // Hack: We need to reload the scene GLB file otherwise the elves will still have the presents from before.
    await Scene.preload();

    this.startLevel();
    this.paused = false;
    this.scoreboard.restart()

    // Focus on the main button for keyboard controls after restarting.
    this.containerButton.focus();
  }

  gameover() {
    this.paused = true;
    this.gameoverView.show();

    window.santaApp.fire('sound-trigger', 'bl_game_stop');
    window.santaApp.fire('sound-trigger', 'music_ingame_gameover');
    window.santaApp.fire('analytics-track-game-over', {
      gameid: 'railroad',
      score: this.scoreboard.score,
    });
  }

  mainLoop() {
    this.update();
    this.render();

    requestAnimationFrame(() => this.mainLoop());
  }

  render() {
    if (this.paused) {
      return;
    }

    if (this.level) {
      this.level.render(this.renderer);
    }
  }

  /**
   * Handles the main logic for the game by making each system update.
   */
  update() {
    const nowSeconds = Date.now() / 1000;
    const deltaSeconds = Math.min(nowSeconds - this.previousSeconds, maxTimeStep);

    if (!this.paused && this.level) {
      this.level.update(deltaSeconds);
      // Scoreboard update is handled in level.
    }

    this.previousSeconds = nowSeconds;
  }

  setUpListeners(container) {
    // Use `touchstart` for touch interfaces.
    container.addEventListener('touchstart', e => {
      const touch = e.changedTouches[0];
      this.handleClick(touch.clientX, touch.clientY);
    });

    // Prevent the click event from firing on touch devices.
    container.addEventListener('touchend', e => {
      e.preventDefault();
    }, {passive: false})

    // Use `click` for mouse interfaces and for accessibility
    container.addEventListener('click', e => {
      // Keep track of the first few clicks
      if (this.previousClicks.length < 25) {
        this.previousClicks.push(e);
      }

      const numClicksPerPosition = new Map();
      for (const click of this.previousClicks) {
        const clickStr = mouseEventToString(click);
        if (!numClicksPerPosition.has(clickStr)) {
          numClicksPerPosition.set(clickStr, 0);
        }
        const prevValue = numClicksPerPosition.get(clickStr);
        numClicksPerPosition.set(clickStr, prevValue + 1)
      }

      const percentOfClicksAtThisPosition =
        numClicksPerPosition.get(mouseEventToString(e)) / this.previousClicks.length
      // Whether this click is in the same position as 90% of the previous clicks.
      const thisClickIsCommonClickPosition = percentOfClicksAtThisPosition >= 0.9;

      const allClicksPossibleAccessibilityClick =
        this.previousClicks.every(click => isPossibleClickFromAccessibiltyTool(container, click));

      // If we have 1 to 3 clicks, use their position to guess if they're from
      // an accessibility tool
      if (this.previousClicks.length <= 3 && allClicksPossibleAccessibilityClick) {
        console.log('throw to closest because of allClicksPossibleAccessibilityClick');
        this.level.throwToClosest();
      }
      // If we have more than 3 clicks, if they're from an accessibility tool
      // they should all be in the same place so use that instead.
      else if (this.previousClicks.length > 3 && thisClickIsCommonClickPosition) {
        console.log('throw to closest because of common click position');
        this.level.throwToClosest();
      }
      else {
        this.handleClick(e.clientX, e.clientY);
      }
    });

    document.querySelector('.throw-accessibility-button').addEventListener('click', e => {
      console.log('throw to closest from button');
      this.level.throwToClosest();
      e.stopPropagation();
    })

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      if (this.level) {
        this.level.scene.updateCameraSize();
      }
    });
  }

  /**
   * @param {number} clientX
   * @param {number} clientY
   */
  handleClick(clientX, clientY) {
    if (!this.paused && this.level) {
      this.level.handleClick(clientX, clientY);
    }
  }
}

/**
 * @param {MouseEvent} e Mouse event
 * @returns A string representation that works in a map.
 */
function mouseEventToString(e) {
  return Math.round(e.clientX) + ":" + Math.round(e.clientY);
}

/**
 * @param {HTMLElement} element Element that handles click events
 * @param {MouseEvent} e Click event
 * @returns {boolean} Whether this click could've been fired from an accessibility tool (e.g. TalkBack).
 */
function isPossibleClickFromAccessibiltyTool(element, e) {
  if (e.clientX === 0 && e.clientY === 0) {
    return true;
  }
  if (e.clientX === undefined || e.clientY === undefined) {
    return true;
  }

  const rect = element.getBoundingClientRect();
  const elemCenterX = rect.x + rect.width / 2;
  const elemCenterY = rect.y + rect.height / 2;

  return (Math.abs(elemCenterX - e.clientX) < 1 && Math.abs(elemCenterY - e.clientY) < 1);
}

app.Game = Game;
