goog.provide('app.systems.RaycasterSystem');

class RaycasterSystem {

  constructor(renderer, camera, placeholderScene, scoreboard) {
    this.renderer = renderer;
    this.camera = camera;
    this.placeholderScene = placeholderScene;
    this.scoreboard = scoreboard;
    this.raycaster = new THREE.Raycaster();
  }

  cast(clickEvent) {
    const intersections = this.getIntersections(clickEvent);
    this.updateScore(intersections);
    return intersections;
  }

  getIntersections(clickEvent) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    const ray = new THREE.Vector2(0, 0);
    ray.x = (clickEvent.clientX / this.renderer.domElement.width) * 2 - 1;
    ray.y = -(clickEvent.clientY / this.renderer.domElement.height) * 2 + 1; 
    this.raycaster.setFromCamera(ray, this.camera);
    return this.raycaster.intersectObjects(this.placeholderScene.scene.children, true);
  }

  updateScore(intersections) {
    let score = 0;
    for (const {object} of intersections) {
      if (object.userData.isElf === true) {
        score += 1;
      } else if (object.userData.clickable && object.userData.clickable.type === 'ice') {
        this.placeholderScene.setTimeScale(0.5);
      }
    }
    this.scoreboard.addScore(score);
  }
}

app.RaycasterSystem = RaycasterSystem;
