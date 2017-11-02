const { Vector3 } = self.THREE;

const intermediateVector3 = new Vector3();

export class TetheredCameraTracker {
  constructor(camera, target, tetherDistance = 100.0, acceleration = 0.15) {
    this.camera = camera;
    this.target = target;

    this.tetherDistance = tetherDistance;
    this.acceleration = acceleration;
    this.velocity = new Vector3(0.0, 0.0, 0.0);
  }

  update(game) {
    const { width, height } = game;

    const delta = intermediateVector3;
    delta.subVectors(this.target.position, this.camera.position);
    delta.z = 0;

    const deltaLength = delta.length();

    if (deltaLength >= this.tetherDistance) {
      delta.normalize().multiplyScalar(this.acceleration);
      this.velocity.add(delta);
    } else {
      delta.normalize().multiplyScalar(
          length / this.tetherDistance * this.acceleration);
      this.velocity.sub(delta);
    }

    if (this.velocity.length() > 0.1) {
      this.velocity.x = this.velocity.x > 0 ? this.velocity.x - 0.1 : this.velocity.x + 0.1;
      this.velocity.y = this.velocity.y > 0 ? this.velocity.y - 0.1 : this.velocity.y + 0.1;
    } else {
      this.velocity.set(0.0, 0.0, 0.0);
    }

    this.camera.position.add(this.velocity);
  }
};
