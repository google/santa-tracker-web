/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

  teardown(game) {
    this.quadTree.clear();
    this.collidables.clear();
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
      const handlers = this.collisionHandlers.get(collidable) || [];
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
        this.collisionDebugLimit.position.x = this.collisionLimit.position.x;
        this.collisionDebugLimit.position.y = this.collisionLimit.position.y;
        this.collisionDebugLimit.position.z = game.mapSystem.grid.cellSize;
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

    const collisionLimit = this.collisionLimit || this.bounds;

    this.collidables.forEach(collidable => {
      const collider = this.getCollider(collidable);

      if (!collisionLimit.contains(collider)) {
        return;
      }

      const nearbyCollidables = this.quadTree.getObjectsNear(collidable);
      //console.log('Nearby collidables:', nearbyCollidables.length);

      for (let i = 0; i < nearbyCollidables.length; ++i) {
        const nearbyCollidable = nearbyCollidables[i];

        if (nearbyCollidable === collidable) {
          continue;
        }

        const nearbyCollider = this.getCollider(nearbyCollidable);

        //let collidableCollisions = measuredCollisions.get(nearbyCollidable);
        let nearbyCollisions = measuredCollisions[nearbyCollidable.uuid];

        if (!nearbyCollisions) {
          //nearbyCollisions = new WeakSet();
          //measuredCollisions.set(nearbyCollidable, nearbyCollisions);
          nearbyCollisions = {};
          measuredCollisions[nearbyCollidable.uuid] = nearbyCollisions;
        //} else if (collidableCollisions.has(collidable)) {
        } else if (nearbyCollisions[collidable.uuid]) {
          continue;
        } else {
          nearbyCollisions[collidable.uuid] = true;
        }

        let collidableCollisions = measuredCollisions[collidable.uuid];

        if (collidableCollisions &&
            collidableCollisions[nearbyCollidable.uuid]) {
          continue;
        }

        if (collider.intersects(nearbyCollider)) {
          this.notifyCollision(collidable, nearbyCollidable);
          this.notifyCollision(nearbyCollidable, collidable);
        }
      }
    });
  }
}
