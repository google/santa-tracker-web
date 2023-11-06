goog.provide('app.CameraSystem');

class CameraSystem {

  constructor(camera, placeholderScene) {
    this.camera = camera;
    this.placeholderScene = placeholderScene;
  }

  update(deltaSeconds) {
    if (!this.seconds) {
      this.seconds = Date.now() / 1000;
    }
    this.camera.position.copy(this.placeholderScene.getCameraPosition(this.seconds + deltaSeconds));
    // Look at where we're going to be.
    this.camera.lookAt(this.placeholderScene.getCameraPosition(this.seconds + deltaSeconds + 3));
    this.seconds = this.seconds + deltaSeconds;
  }
}

app.CameraSystem = CameraSystem;
