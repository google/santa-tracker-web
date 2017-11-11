const { Vector3 } = self.THREE;

const intermediateVector3 = new Vector3();

export class TetheredCameraTracker {
  constructor(camera, target, tetherDistance = 100.0, acceleration = 0.15) {
    camera.position.x = target.position.x;
    camera.position.y = target.position.y;

    this.camera = camera;
    this.target = target;

    this.tetherDistance = tetherDistance;
    this.acceleration = acceleration;
    this.velocity = new Vector3(0.0, 0.0, 0.0);
  }

  update(game) {
    const { width, height } = game;
    const delta = intermediateVector3;
    // TODO(cdata): Need to address why the y axis of the camera is
    // inverted relative to the gimbal. Flipping it here for now:
    delta.copy(this.target.position);
    delta.y *= -0.75;
    delta.subVectors(delta, this.camera.position);
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
