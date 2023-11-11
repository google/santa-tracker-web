// Entry point for the railroad game itself. This sets up the main loop of the game.

goog.provide('app.Game');

goog.require('app.CameraSystem');
goog.require('app.Constants');
goog.require('app.ElvesSystem');
goog.require('app.PlaceholderScene');
goog.require('app.RaycasterSystem');
goog.require('app.shared.Scoreboard');

class Game {

  constructor() {
    this.paused = false;
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
  start(container) {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);
  
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.scoreboard = new app.shared.Scoreboard(this, undefined, app.Constants.NUM_LEVELS);

    // TODO: Put this in a level initialization section.
    this.placeholderScene = new app.PlaceholderScene();
    this.cameraSystem = new app.CameraSystem(this.camera, this.placeholderScene);
    this.elvesSystem = new app.ElvesSystem(this.camera, this.placeholderScene);

    this.raycasterSystem = new app.RaycasterSystem(this.renderer, this.camera, this.placeholderScene, this.scoreboard);

    this.setUpListeners();
    this.mainLoop();
  }

  pause() {
    this.paused = true;
    this.previousSeconds = null;
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
    if (!this.paused) {
      console.warn('Game must be paused before it can be restarted');
      return;
    }
    console.log('TODO');
    this.paused = false;
    this.mainLoop();
  }

  gameover() {
    console.error('TODO');
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
    this.renderer.render(this.placeholderScene.scene, this.camera);
  }

  /**
   * Handles the main logic for the game by making each system update.
   */
  update() {
    const nowSeconds = Date.now() / 1000;
    const deltaSeconds = nowSeconds - this.previousSeconds;
    this.cameraSystem.update(deltaSeconds);
    this.elvesSystem.update(deltaSeconds);
    this.scoreboard.onFrame(deltaSeconds);
    this.previousSeconds = nowSeconds;
    
  }

  setUpListeners() {
    this.clickListener = this.renderer.domElement.addEventListener('click', (click) => {
      this.handleClick(click);
    });
  }

  handleClick(clickEvent) {
    this.raycasterSystem.cast(clickEvent);
  }
}

app.Game = Game;
