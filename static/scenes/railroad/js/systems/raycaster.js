goog.provide('app.systems.RaycasterSystem');

class RaycasterSystem {

  /**
   * @param {*} renderer ThreeJS renderer.
   * @param {*} camera ThreeJS camera.
   * @param { app.Scene } placeholderScene Our scene class
   */
  constructor(renderer, camera, scene) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
  }

  cast(clientX, clientY) {
    return this.getIntersections(clientX, clientY);
  }

  project(worldPosition) {
    const v = worldPosition.project(this.camera);
    v.x = ( v.x + 1) * this.renderer.domElement.width / 2;
    v.y = - ( v.y - 1) * this.renderer.domElement.height / 2;
    v.z = 0;
    return v;
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
}

app.RaycasterSystem = RaycasterSystem;
