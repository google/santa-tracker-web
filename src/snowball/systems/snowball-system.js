import { QuadTree } from '../../engine/utils/quad-tree.js';
import { Snowball } from '../entities/snowball.js';
import { BigSnowball } from '../entities/snowballs/big-snowball.js';
import { itemType } from '../systems/drop-system.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const intermediateVector2 = new Vector2();

const snowballConstructorForType = type => {
  switch(type) {
    default:
    case itemType.NOTHING: return Snowball;
    case itemType.BIG_SNOWBALL: return BigSnowball;
  }
}

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

      if (snowball.collidedWith != null) {
        this.removeSnowball(snowball, game);
        continue;
      }

      snowball.update(game);

      if (snowball.thrown && snowball.presence.gone) {
        this.removeSnowball(snowball, game);
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

    intermediateVector2.subVectors(
        trajectory.targetPosition, trajectory.origin);

    effectSystem.snowsplatEffect.show(
        snowball.position.clone(), intermediateVector2.clone().normalize());

    this.snowballs.splice(this.snowballs.indexOf(snowball), 1);
    this.snowballLayer.remove(snowball);

    collisionSystem.removeCollidable(snowball);

    snowball.teardown(game);
    Snowball.free(snowball);
  }

  throwSnowball(thrower, target) {
    const { powerup } = thrower;
    const type = powerup == null ? itemType.NOTHING : powerup.snowballType;

    const SnowballConstructor = snowballConstructorForType(type);
    const snowball = SnowballConstructor.allocate(thrower);
    snowball.throwAt(target);
    this.newSnowballs.push(snowball);
  }
}
