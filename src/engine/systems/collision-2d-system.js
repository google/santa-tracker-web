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
    this.quadTree = new QuadTree(0, bounds, 10, 6, this.getCollider);
    this.collidables.forEach(collidable => this.quadTree.add(collidable));
  }

  get bounds() {
    return this.quadTree && this.quadTree.bounds;
  }

  handleCollisions(collidable, handler) {
    if (!this.collisionHandlers.has(collidable)) {
      this.collisionHandlers.set(collidable, []);
    }

    this.collisionHandlers.get(collidable).push(handler);

    return () => {
      const handlers = this.collisionHandlers.get(collidable);
      const handlerIndex = handlers.indexOf(handler);

      handlers.splice(handlerIndex, 1);

      if (handlers.length === 0) {
        this.collisionHandlers.delete(collidable);
      }
    };
  }

  addCollidable(collidable) {
    if (!this.collidables.has(collidable)) {
      this.collidables.add(collidable);
      //this.quadTree && this.quadTree.add(collidable);
    }
  }

  removeCollidable(collidable) {
    if (this.collidables.has(collidable)) {
      this.collidables.delete(collidable);
      //this.quadTree && this.quadTree.remove(collidable);
    }
  }

  notifyCollision(object, other) {
    if (this.collisionHandlers.has(object)) {
      const handlers = this.collisionHandlers.get(object);
      for (let i = 0; i < handlers.length; ++i) {
        handlers[i](object, other);
      }
    }
  }

  update(game) {
    if (this.quadTree == null) {
      return;
    }

    //const measuredCollisions = new WeakMap();
    const measuredCollisions = {};

    this.quadTree.clear();
    this.collidables.forEach(collidable => this.quadTree.add(collidable));

    this.collidables.forEach(collidable => {
      const collider = this.getCollider(collidable);
      const nearbyCollidables = this.quadTree.getObjectsNear(collidable);
      //console.log('Nearby collidables:', nearbyCollidables.length);

      for (let i = 0; i < nearbyCollidables.length; ++i) {
        const nearbyCollidable = nearbyCollidables[i];

        if (nearbyCollidable === collidable) {
          continue;
        }

        const nearbyCollider = this.getCollider(nearbyCollidable);

        //let collidableCollisions = measuredCollisions.get(nearbyCollidable);
        let collidableCollisions = measuredCollisions[nearbyCollidable.uuid];

        if (!collidableCollisions) {
          //collidableCollisions = new WeakSet();
          //measuredCollisions.set(nearbyCollidable, collidableCollisions);
          collidableCollisions = {};
          measuredCollisions[nearbyCollidable.uuid] = collidableCollisions;
        //} else if (collidableCollisions.has(collidable)) {
        } else if (collidableCollisions[collidable.uuid]) {
          continue;
        }

        //collidableCollisions.add(collidable);
        collidableCollisions[collidable.uuid] = true;

        if (collider.intersects(nearbyCollider)) {
          this.notifyCollision(collidable, nearbyCollidable);
          this.notifyCollision(nearbyCollidable, collidable);
        }
      }
    });
  }
}
