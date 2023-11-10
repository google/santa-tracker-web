goog.provide('app.RaycasterSystem');

class RaycasterSystem {

  constructor(renderer, camera, placeholderScene, scoreboard) {
    this.renderer = renderer;
    this.camera = camera;
    this.placeholderScene = placeholderScene;
    this.scoreboard = scoreboard;
    this.raycaster = new THREE.Raycaster();
  }

  cast(clickEvent) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    const ray = new THREE.Vector2(0, 0);
    ray.x = (clickEvent.clientX / this.renderer.domElement.width) * 2 - 1;
    ray.y = -(clickEvent.clientY / this.renderer.domElement.height) * 2 + 1; 
    this.raycaster.setFromCamera(ray, this.camera);
    const intersects = this.raycaster.intersectObjects(this.placeholderScene.scene.children, true);
    this.scoreboard.addScore(intersects.length);
  }
}

app.RaycasterSystem = RaycasterSystem;
