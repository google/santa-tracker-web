import { Component } from './component.js';

const {
  Vector2
} = self.THREE;

export class Trajectory extends Component {
  constructor() {
    super();
    this.origin = new Vector2();
    this.targetPosition = new Vector2();
  }

  get direction() {
    const direction = new Vector2();
    direction.subVectors(this.targetPosition, this.origin).normalize();
    return direction;
  }
};
