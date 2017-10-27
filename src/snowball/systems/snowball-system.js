import { QuadTree } from '../../engine/utils/quad-tree.js';
import { Snowball } from '../entities/snowball.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const path = new Vector2();

export class SnowballSystem {
  constructor(drag) {
    this.snowballs = [];
    this.newSnowballs = [];
    this.snowballLayer = new Object3D();

    this.drag = drag;
  }

  update(game) {
    while (this.newSnowballs.length) {
      this.setupSnowball(this.newSnowballs.pop(), game);
    }

    for (let i = 0; i < this.snowballs.length; ++i) {
      const snowball = this.snowballs[i];

      if (snowball.collidedWith != null) {
        console.log('Snowball collided with a thing!');
        this.removeSnowball(snowball, game);
        break;
      }

      snowball.update(game);

      if (snowball.thrown) {
        const tickDelta = game.preciseTick - snowball.tickWhenThrown;

        path.subVectors(snowball.targetPosition, snowball.origin)
          .clampLength(0, 256);

        const duration = path.length() / 256 * 32;

        path.multiplyScalar(tickDelta / duration)
          .add(snowball.origin);

        snowball.position.x = path.x;
        snowball.position.y = path.y;
        snowball.position.z = path.y / 10;
        console.log(snowball.position.z);

        if (tickDelta >= duration) {
          this.removeSnowball(snowball, game);
        }
      }
    }
  }

  setupSnowball(snowball, game) {
    const { collisionSystem } = game;

    collisionSystem.addCollidable(snowball);

    this.snowballs.push(snowball);
    this.snowballLayer.add(snowball);
    snowball.setup(game);
  }

  removeSnowball(snowball, game) {
    const { collisionSystem } = game;
    this.snowballs.splice(this.snowballs.indexOf(snowball), 1);
    this.snowballLayer.remove(snowball);

    collisionSystem.removeCollidable(snowball);

    snowball.teardown(game);
    Snowball.free(snowball);
  }

  throwSnowball(origin, target) {
    const snowball = Snowball.allocate(origin);
    snowball.throwAt(target);
    this.newSnowballs.push(snowball);
  }
}
