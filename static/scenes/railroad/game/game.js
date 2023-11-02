// Entry point for the railroad game itself. This sets up the main loop of the game.

import { CameraSystem } from "./camera-system.js";
import { PlaceholderScene } from "./scene.js";

export class Game {

  /**
   * @param {HTMLElement} container The element that hosts the rendering for the game.
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

    this.placeholderScene = new PlaceholderScene();
    this.cameraSystem = new CameraSystem(this.camera, this.placeholderScene);

    this.mainLoop();
  }

  mainLoop() {
    this.update();
    this.render();

    requestAnimationFrame(() => this.mainLoop());
  }

  render() {
    this.renderer.render(this.placeholderScene.scene, this.camera);
  }

  /** Does the main logic for the game. */
  update() {
    this.cameraSystem.update();
  }
}
