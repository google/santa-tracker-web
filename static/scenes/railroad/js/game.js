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
  async start(container) {
    container.appendChild(this.renderer.domElement);

    await Promise.all([
      app.Scene.preload(),
      app.Present.preload(),
    ]);

    this.setUpListeners();
    this.mainLoop();

    this.startLevel();
  }

  startLevel() {
    if (this.level) {
      this.level.cleanUp();
    }
    this.level = new Level(this.renderer, (score) => this.scoreboard.addScore(score));
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (!this.paused) {
      console.warn('Game must be paused before it can be resumed');
      return;
    }
    this.paused = false;
    this.previousSeconds = Date.now() / 1000;
    this.mainLoop();
  }

  restart() {
    this.scoreboard.restart()
    this.startLevel();
  }

  gameover() {
    this.paused = true;
    this.gameoverView.show();
  }

  mainLoop() {
    if (this.paused) {
      return;
    }
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
      this.scoreboard.onFrame(deltaSeconds);
    }

    this.previousSeconds = nowSeconds;
  }

  setUpListeners() {
    this.renderer.domElement.addEventListener('click', (click) => {
      this.handleClick(click);
    });

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      if (this.level) {
        this.level.scene.updateCameraSize();
      }
    });
  }

  handleClick(clickEvent) {
    if (!this.paused && this.level) {
      this.level.handleClick(clickEvent);
    }
  }
}

app.Game = Game;
