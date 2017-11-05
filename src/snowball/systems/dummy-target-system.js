import { DummyTarget } from '../entities/dummy-target.js';
import { Snowball } from '../entities/snowball.js';

const { Object3D } = self.THREE;

export class DummyTargetSystem {
  constructor() {
    this.dummies = [];
    this.dummyTargetLayer = new Object3D();
    this.dummyTargetLayer.z -= 20.0;
  }

  update(game) {
    while (this.dummies.length < 10) {
      this.addDummyTarget(game);
    }

    for (let i = 0; i < this.dummies.length; ++i) {
      this.dummies[i].update(game);
    }
  }

  addDummyTarget(game) {
    const { collisionSystem, mapSystem } = game;
    const { grid, map } = mapSystem;

    const target = new DummyTarget(34);

    this.dummies.push(target);
    this.dummyTargetLayer.add(target);

    const unsubscribe = collisionSystem.handleCollisions(target, (dummy, other) => {
      if (other instanceof Snowball) {
        console.warn('Dummy hit!');
        unsubscribe();
        this.removeDummyTarget(game, target);
      }
    });

    let index;
    let state;
    let sprite;

    do {
      index = Math.floor(Math.random() * map.tileCount);
      state = map.getTileState(index);
      sprite = map.getTileObstacle(index);
    } while ((state < 1.0 || state > 2.0 || (sprite > -1 && sprite < 4.0)));

    let position = grid.indexToPosition(index);

    target.setup(game);

    target.position.x = position.x;
    target.position.y = position.y;
    //target.position.z = target.position.y;
  }

  removeDummyTarget(game, target) {
    console.log('Removing dummy!');
    target.teardown(game);
    this.dummies.splice(this.dummies.indexOf(target), 1);
    this.dummyTargetLayer.remove(target);
  }
}
