import { QuadTree } from '../utils/quad-tree.js';

export class Collision2DSystem {
  constructor(getCollider = object => object.collider) {
    //this.quadTree = new QuadTree(0, bounds, 10, 5, getCollider);
    this.collisionHandlers = new Map();
    this.collidables = new Set();
    this.getCollider = getCollider;
    this.quadTree = null;
  }

  set bounds(bounds) {
    this.quadTree = new QuadTree(0, bounds, 10, 5, this.getCollider);
    this.collidables.forEach(collidable => this.quadTree.insert(collidable));
  }

  get bounds() {
    return this.quadTree && this.quadTree.bounds;
  }

  handleCollisions(collidable, handler) {
    if (!this.collisionHandlers.has(object)) {
      this.collisionHandlers.set(object, []);
    }

    this.collisionHandlers.get(object).push(handler);

    return () => {
      const handlers = this.collisionHandlers.get(object);
      const handlerIndex = handlers.indexOf(handler);

      handlers.splice(handlerIndex, 1);

      if (handlers.length === 0) {
        this.collisionHandlers.delete(object);
      }
    };
  }

  addCollidable(collidable) {
    if (!this.collidables.has(collidable)) {
      this.collidables.add(collidable);
      this.quadTree && this.quadTree.insert(collidable);
    }
  }

  removeCollidable(collidable) {
    if (this.collidables.has(collidable)) {
      this.collidables.remove(collidable);
      this.quadTree && this.quadTree.remove(collidable);
    }
  }

  notifyCollision(object, other) {
    if (this.collisionHandlers.has(object)) {
      const handlers = this.collisionHandlers.get(object);
      for (let i = 0; i < handlers.length; ++i) {
        handlers(object, other);
      }
    }
  }

  update(game) {
    if (this.quadTree == null) {
      return;
    }

    const measuredCollisions = new WeakMap();

    this.collidables.forEach(collidable => {
      const collider = this.getCollider(collidable);
      const nearbyCollidables = this.quadTree.getObjectsNear(collidable);

      for (let i = 0; i < nearbyCollidables.length; ++i) {
        const nearbyCollidable = nearbyCollidables[i];
        const nearbyCollider = this.getCollider(collidable);

        const collidableCollisions = measuredCollisions.get(nearbyCollidable);

        if (!collidableCollisions) {
          measuredCollisions.set(nearbyCollidable, new WeakSet());
        } else if (collidableCollisions.has(collidable)) {
          continue;
        }

        collidableCollisions.add(collidable);

        if (collider.intersects(nearbyCollider)) {
          this.notifyCollision(object, other);
          this.notifyCollision(other, object);
        }
      }
    });
  }
}
