import { QuadTree } from '../../engine/utils/quad-tree.js';
import { Snowball } from '../entities/snowball.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const path = new Vector2();

const PI_OVER_FOUR = Math.PI / 4.0;
const PI_OVER_TWO = Math.PI / 2.0;

export class SnowballSystem {
  constructor(drag) {
    this.snowballs = [];
    this.newSnowballs = [];
    this.snowballLayer = new Object3D();

    this.drag = drag;
  }

  update(game) {

    const { mapSystem, collisionSystem, effectSystem } = game;
    const { bounds } = collisionSystem;
    const { grid, map } = mapSystem;

    // NOTE(cdata): This is just for testing perf of a lot of collidable
    // objects in the scene at one time:
    //for (let i = 0; i < 32; ++i) {
      //const targetX = Math.random() * (bounds.br.x - bounds.tl.x) + bounds.tl.x;
      //const originX = Math.random() * (bounds.br.x - bounds.tl.x) + bounds.tl.x;
      //const targetY = Math.random() * (bounds.tl.y - bounds.br.y) + bounds.br.y;
      //const originY = Math.random() * (bounds.tl.y - bounds.br.y) + bounds.br.y;

      //this.throwSnowball(new Vector2(targetX, targetY), new Vector2(originX, originY));
    //}

    while (this.newSnowballs.length) {
      this.setupSnowball(this.newSnowballs.pop(), game);
    }

    for (let i = 0; i < this.snowballs.length; ++i) {
      const snowball = this.snowballs[i];
      const { trajectory } = snowball;

      if (snowball.collidedWith != null) {
        this.removeSnowball(snowball, game);
        continue;
      }

      snowball.update(game);

      if (snowball.thrown) {
        const tickDelta = game.preciseTick - snowball.tickWhenThrown;
        const maxDistance = 256;

        path.subVectors(trajectory.targetPosition, trajectory.origin)
            .clampLength(0, maxDistance);

        const maxAnimationFrames = 42;
        const durationScale = path.length() / maxDistance;
        const duration = maxAnimationFrames * durationScale;
        const time = tickDelta / duration;

        const shotAngle = path.angle();
        const arcScale = Math.abs((shotAngle % Math.PI) - PI_OVER_TWO) / PI_OVER_TWO;
        const arcSize = arcScale * arcScale *
            Math.sin(time * Math.PI) * 20.0 * durationScale;

        path.multiplyScalar(time)
          .add(trajectory.origin);

        snowball.position.x = path.x;
        snowball.position.y = path.y;
        snowball.position.z = grid.cellSize / 2.0 + arcSize;
        //snowball.position.z = path.y;

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
    const { collisionSystem, effectSystem } = game;
    const { trajectory } = snowball;
    console.log('Removing a snowball!');

    path.subVectors(trajectory.targetPosition, trajectory.origin);

    effectSystem.snowsplatEffect.show(
              snowball.position.clone(), path.clone().normalize());

    this.snowballs.splice(this.snowballs.indexOf(snowball), 1);
    this.snowballLayer.remove(snowball);

    collisionSystem.removeCollidable(snowball);

    snowball.teardown(game);
    Snowball.free(snowball);
  }

  throwSnowball(thrower, target) {
    const snowball = Snowball.allocate(thrower);
    snowball.throwAt(target);
    this.newSnowballs.push(snowball);
  }
}
