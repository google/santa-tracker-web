import { QuadTree } from '../utils/quad-tree.js';

const {
  Object3D,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial
} = self.THREE;

export class Collision2DSystem {
  constructor(getCollider = object => object.collider, debug = false) {
    this.debug = debug;
    this.collisionHandlers = new Map();
    this.collidables = new Set();
    this.getCollider = getCollider;
    this.quadTree = null;
    this.collisionDebugLayer = debug ? new Object3D() : null;
    this.collisionDebugObjects = debug ? new Map() : null;
    this.collisionDebugBounds = null;
    this.collisionDebugLimit = null;

    this.collisionLimit = null;
  }

  set limit(limit) {
    this.collisionLimit = limit;

    if (this.debug) {
      if (this.collisionDebugLimit != null) {
        this.collisionDebugLayer.remove(this.collisionDebugLimit);
      }

      const collisionDebugLimit = new Mesh(
          new PlaneBufferGeometry(limit.width, limit.height),
          new MeshBasicMaterial({
            color: 0x00ff00,
            opacity: 0.25,
            transparent: true,
            side: 2
          }));

      this.collisionDebugLayer.add(collisionDebugLimit);
      this.collisionDebugLimit = collisionDebugLimit;
    }
  }

  set bounds(bounds) {
    this.quadTree = new QuadTree(0, bounds, 10, 6, this.getCollider);
    this.collidables.forEach(collidable => this.quadTree.add(collidable));

    if (this.debug) {
      if (this.collisionDebugBounds != null) {
        this.collisionDebugLayer.remove(this.collisionDebugBounds);
      }

      const collisionDebugBounds = new Mesh(
          new PlaneBufferGeometry(bounds.width, bounds.height),
          new MeshBasicMaterial({
            color: 0x00ff00,
            opacity: 1.0,
            transparent: true,
            wireframe: true,
            //wireframe: true,
            side: 2
          }));

      this.collisionDebugLayer.add(collisionDebugBounds);
      this.collisionDebugBounds = collisionDebugBounds;
    }
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

      if (this.debug) {
        const collider = this.getCollider(collidable);
        const object = new Mesh(
            new PlaneBufferGeometry(collider.width, collider.height),
            new MeshBasicMaterial({
              color: 0x00ff00,
              transparent: true,
              opacity: 0.5,
              side: 2
            }));

        this.collisionDebugObjects.set(collidable, object);
        this.collisionDebugLayer.add(object);
      }
    }
  }

  removeCollidable(collidable) {
    if (this.collidables.has(collidable)) {
      this.collidables.delete(collidable);

      if (this.debug) {
        const collider = this.getCollider(collidable);
        const object = this.collisionDebugObjects.get(collidable);

        this.collisionDebugObjects.delete(collidable);
        this.collisionDebugLayer.remove(object);
      }
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

    if (this.debug) {
      if (this.collisionDebugLimit && this.collisionLimit) {
        this.collisionDebugLimit.position.copy(this.collisionLimit.position);
      }
      this.collisionDebugObjects.forEach((object, collidable) => {
        const collider = this.getCollider(collidable);
        object.position.x = collider.position.x;
        object.position.y = collider.position.y;
        object.position.z = 2.0;
      });
    }

    const measuredCollisions = {};

    this.quadTree.clearDynamic();
    this.collidables.forEach(collidable => {
      if (!collidable.static) {
        this.quadTree.add(collidable);
      }
    });

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
