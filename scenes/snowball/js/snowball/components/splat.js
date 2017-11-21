const {
  Vector2
} = self.THREE;

export class Splat {
  constructor(position = new Vector2(),
              direction = new Vector2(),
              size = 40.0,
              quantity = 5) {
    this.position = position;
    this.direction = direction;
    this.size = size;
    this.quantity = quantity;
  }
};
