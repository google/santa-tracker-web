import { Component } from './component.js';

const {
  Vector2
} = self.THREE;

export class Splat extends Component {
  constructor(position = new Vector2(),
              direction = new Vector2(),
              size = 40.0,
              quantity = 5) {
    super();
    this.position = position;
    this.direction = direction;
    this.size = size;
    this.quantity = quantity;
  }
};
