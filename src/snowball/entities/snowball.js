import { Entity } from '../../engine/core/entity.js';
import { Point } from '../../engine/utils/collision-2d.js';
import { Allocatable } from '../../engine/utils/allocatable.js';

const {
  Mesh,
  Vector2,
  BoxGeometry,
  MeshBasicMaterial
} = self.THREE;

const PI_OVER_TWELVE = Math.PI / 12.0;
const PI_OVER_SIX = Math.PI / 6.0;

export class Snowball extends Allocatable(Entity(Mesh)) {
  constructor() {
    super(new BoxGeometry(10, 10, 10),
        new MeshBasicMaterial({ color: 0xff0000, side: 2 }));

    this.collider = Point.allocate(this.position);
    this.targetPosition = new Vector2();
    this.origin = new Vector2();
  }

  initialize(origin) {
    this.origin.copy(origin);
    this.thrown = false;
    this.tickWhenThrown = -1;
    this.targetPosition.set(0, 0);
    this.skew = 0;
    this.collidedWith = null;
    this.visible = false;
  }

  setup(game) {
    const { collisionSystem } = game;

    this.unsubscribeFromCollisions = collisionSystem.handleCollisions(this,
        (snowball, collidable) => {
          this.collidedWith = collidable;
          this.visible = false;
        });
  }

  teardown(game) {
    this.unsubscribeFromCollisions();
  }

  update(game) {
    if (!this.thrown) {
      return;
    }

    if (this.tickWhenThrown === -1) {
      this.tickWhenThrown = game.tick;
    }
  }

  throwAt(target) {
    if (!this.thrown) {
      this.visible = true;
      this.thrown = true;
      this.targetPosition.copy(target);

      // ±15º skew on the throw
      this.skew = Math.random() * PI_OVER_SIX - PI_OVER_TWELVE;
    }
  }

  deserialize(object) {
    Object.assign(this, object);
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
};

window.S = Snowball;

