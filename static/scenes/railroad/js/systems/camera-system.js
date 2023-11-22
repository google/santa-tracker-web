goog.provide('app.systems.CameraSystem');

class CameraSystem {

  constructor(camera, placeholderScene) {
    this.camera = camera;
    this.placeholderScene = placeholderScene;
    this.seconds = 0;
  }

  update(deltaSeconds) {
    this.seconds = this.seconds + deltaSeconds;
    this.camera.position.copy(this.placeholderScene.getCameraPosition(this.seconds));
    // Look at where we're going to be.
    this.camera.lookAt(this.placeholderScene.getCameraPosition(this.seconds + 3));
  }
}

app.CameraSystem = CameraSystem;
