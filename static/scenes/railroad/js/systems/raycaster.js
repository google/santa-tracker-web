goog.provide('app.systems.RaycasterSystem');

class RaycasterSystem {

  /**
   * @param {*} renderer ThreeJS renderer.
   * @param {*} camera ThreeJS camera.
   * @param { app.Scene } placeholderScene Our scene class
   * @param { function(number):void } addScore Function for adding to the game's score.
   */
  constructor(renderer, camera, scene, addScore) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.addScore = addScore;
    this.raycaster = new THREE.Raycaster();
  }

  cast(clientX, clientY) {
    const intersections = this.getIntersections(clientX, clientY);
    this.updateScore(intersections);
    return intersections;
  }

  getIntersections(clientX, clientY) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components
    const ray = new THREE.Vector2(0, 0);
    ray.x = (clientX / this.renderer.domElement.width) * 2 - 1;
    ray.y = -(clientY / this.renderer.domElement.height) * 2 + 1; 
    this.raycaster.setFromCamera(ray, this.camera);
    return this.raycaster.intersectObjects(this.scene.scene.children, true);
  }

  updateScore(intersections) {
    let score = 0;
    for (const {object} of intersections) {
      if (!object.userData.clickable) {
        continue;
      }
      if (object.userData.clickable.type === 'elf') {
        score += 1;
      } else if (object.userData.clickable.type === 'ice') {
        this.scene.setTimeScale(0.5);
      }
    }
    this.addScore(score);
  }
}

app.RaycasterSystem = RaycasterSystem;
