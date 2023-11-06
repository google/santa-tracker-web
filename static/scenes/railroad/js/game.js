// Entry point for the railroad game itself. This sets up the main loop of the game.

import { CameraSystem } from "./camera-system.js";
import { PlaceholderScene } from "./scene.js";

export class Game {

  paused = false;
  previousSeconds = Date.now() / 1000;

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

    // TODO: Put this in a level initialization section.
    this.placeholderScene = new PlaceholderScene();
    this.cameraSystem = new CameraSystem(this.camera, this.placeholderScene);

    this.mainLoop();
  }

  pause() {
    this.paused = true;
    this.previousSeconds = null;
  }

  resume() {
    this.paused = false;
    this.previousSeconds = Date.now() / 1000;
    this.mainLoop();
  }

  restart() {
    console.log('TODO');
    this.paused = false;
    this.mainLoop();
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
    this.previousSeconds = nowSeconds;
    
  }
}
