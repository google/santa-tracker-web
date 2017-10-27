import { QuadTree } from '../../engine/utils/quad-tree.js';
import { Snowball } from '../entities/snowball.js';

const {
  Mesh,
  Vector2
} = self.THREE;

const position = new Vector2();
const velocity = new Vector2();
const deceleration = new Vector2();

export class SnowballSystem {
  constructor(drag) {
    this.freeSnowballs = [];
    this.snowballs = [];
    this.drag = drag;
  }

  update(game) {
    for (let i = 0; i < this.snowballs.length; ++i) {
      const snowball = this.snowballs[i];
    }
  }

  allocateSnowball() {
  }

  getSnowballForPlayer(player) {
  }
}
