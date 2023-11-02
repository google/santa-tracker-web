export class CameraSystem {

  constructor(camera, placeholderScene) {
    this.camera = camera;
    this.placeholderScene = placeholderScene;
  }

  update() {
    const nowSeconds = Date.now() / 1000;
    this.camera.position.copy(this.placeholderScene.getCameraPosition(nowSeconds));
    // Look at where we're going to be
    this.camera.lookAt(this.placeholderScene.getCameraPosition(nowSeconds + 3));
  }
}