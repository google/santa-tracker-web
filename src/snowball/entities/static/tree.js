import { Entity } from '../../../engine/core/entity.js';
import { Circle } from '../../../engine/utils/collision-2d.js';

const { Math } = self.THREE;

export class Tree extends Entity(class {}) {
  constructor(tileIndex, position) {
    super();

    this.tileIndex = tileIndex;
    this.position = position;
    this.position.y += 10;
    this.static = true;
    this.uuid = Math.generateUUID();
    this.collider = null;
  }

  setup(game) {
    this.collider = Circle.allocate(12, this.position);
  }

  teardown(game) {
    Circle.free(this.collider);
    this.collider = null;
  }
};
