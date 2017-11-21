const {
  Vector2
} = self.THREE;

export class Trajectory {
  constructor() {
    this.origin = new Vector2();
    this.targetPosition = new Vector2();
  }

  get direction() {
    const direction = new Vector2();
    direction.subVectors(this.targetPosition, this.origin).normalize();
    return direction;
  }
};
