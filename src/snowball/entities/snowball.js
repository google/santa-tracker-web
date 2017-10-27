import { Entity } from '../../engine/core/entity.js';
import { Point } from '../../engine/utils/collision-2d.js';
import { Allocatable } from '../../engine/utils/allocatable.js';

const {
  Mesh,
  Vector2
} = self.THREE;

const PI_OVER_TWELVE = Math.PI / 12.0;
const PI_OVER_SIX = Math.PI / 6.0;

export class Snowball extends Allocatable(Entity(Mesh)) {
  constructor() {
    super();

    this.collider = new Point(this.position);
    this.targetPosition = new Vector2();
  }

  setup(game) {
    this.thrown = false;
    this.tickWhenThrown = -1;
    this.targetPosition.set(0, 0);
    this.skew = 0;
  }

  update(game) {
    if (!this.thrown) {
      return;
    }

    if (this.tickWhenThrown === -1) {
      this.tickWhenThrown = game.tick;
    }
  }

  throw(target) {
    if (!this.thrown) {
      this.thrown = true;
      this.target.copy(target);
      // ±15º skew on the throw
      this.skew = Math.random() * PI_OVER_SIX - PI_OVER_TWELVE;
    }
  }

  serialize() {
    return {
      thrown: this.thrown,
      tickWhenThrown: this.tickWhenThrown,
      skew: this.skew,
      target: { ...this.target },
      position: { ...this.position }
    };
  };
}
