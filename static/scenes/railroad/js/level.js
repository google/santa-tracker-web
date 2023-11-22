goog.provide('app.Level');

goog.require('app.Scene');
goog.require('app.systems.CameraSystem');
goog.require('app.systems.ElvesSystem');
goog.require('app.systems.RaycasterSystem');
goog.require('app.systems.PresentSystem');

/**
 * Handles everything that lives within one level.
 *
 * For each new level, and when the game is restarted, a new instance will be created.
 */
class Level {

  /**
   * @param {*} renderer ThreeJS renderer.
   * @param { function(number):void } addScore Function for adding to the game's score.
   */
  constructor(renderer, addScore) {
    this.scene = new app.Scene();
    this.camera = this.scene.getCamera();
    this.elvesSystem = new app.ElvesSystem(this.camera, this.scene);
    this.presentSystem = new app.PresentSystem(this.scene);
    this.raycasterSystem = new app.RaycasterSystem(renderer, this.camera, this.scene, addScore);
  }

  cleanUp() {
    // For the moment, it seems like nothing is actually needed here.
  }

  render(renderer) {
    renderer.render(this.scene.scene, this.camera);
  }

  update(deltaSeconds) {
    this.scene.update(deltaSeconds);
    this.elvesSystem.update(deltaSeconds);
    this.presentSystem.update(deltaSeconds);
  }

  handleClick(clickEvent) {
    const intersections = this.raycasterSystem.cast(clickEvent);

    if (intersections.length > 0) {
      this.presentSystem.shoot(intersections[0].point);
    }
  }
}

app.Level = Level;
