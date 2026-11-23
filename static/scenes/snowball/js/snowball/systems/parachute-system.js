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

import { LandingShadow } from '../entities/landing-shadow.js';
import { Parachute } from '../entities/parachute.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const intermediateVector2 = new Vector2();

export class ParachuteSystem {
  constructor(frameCount = 300, dropHeight = 420) {
    this.dropHeight = dropHeight;
    this.frameCount = frameCount;

    this.undroppedEntities = [];
    this.droppingEntities = [];
    this.removedEntities = [];

    this.entityParachutes = new Map();

    // Which entities asked for a landing shadow, and the shadow each dropping
    // one currently owns. Kept apart from the queues above so that
    // `removeEntity` can go on finding entities by identity.
    this.shadowedEntities = new Set();
    this.entityShadows = new Map();

    this.parachuteLayer = new Object3D();
  }

  /**
   * @param {boolean} castShadow Whether to mark the landing tile with a shadow
   *     while the entity descends.
   */
  dropEntity(entity, castShadow = false) {
    if (entity.arrival == null) {
      return;
    }

    if (castShadow) {
      this.shadowedEntities.add(entity);
    }

    this.undroppedEntities.push(entity);
  }

  removeEntity(entity) {
    const undroppedIndex = this.undroppedEntities.indexOf(entity);
    if (undroppedIndex !== -1) {
      this.undroppedEntities.splice(undroppedIndex, 1);
    }

    const droppedIndex = this.droppingEntities.indexOf(entity);
    if (droppedIndex !== -1) {
      this.droppingEntities.splice(droppedIndex, 1);
    }

    this.removedEntities.push(entity);
  }

  /** Detaches and forgets the landing shadow an entity owns, if any. */
  removeShadow(entity) {
    this.shadowedEntities.delete(entity);

    const shadow = this.entityShadows.get(entity);

    if (shadow !== undefined) {
      this.entityShadows.delete(entity);
      this.parachuteLayer.remove(shadow);

      // Each shadow clones its material so it can fade independently, so each
      // one has to give that material back.
      shadow.dispose();
    }
  }

  teardown() {
    this.undroppedEntities.forEach((entity) => this.removeEntity(entity));
    this.droppingEntities.forEach((entity) => this.removeEntity(entity));

    // `removeEntity` only queues its work for the next update, and after
    // teardown no update follows, so the discs would stay parented to the
    // layer. A restart discards this whole system, so nothing visible leaks
    // today; this just keeps the system's own state honest about the fact that
    // nothing is dropping any more.
    this.entityShadows.forEach((shadow) => {
      this.parachuteLayer.remove(shadow);
      shadow.dispose();
    });
    this.entityShadows.clear();
    this.shadowedEntities.clear();
  }

  update(game) {
    const { lodSystem, mapSystem, tick } = game;
    const { grid } = mapSystem;

    this.removedEntities.forEach((entity) => {
      this.removeShadow(entity);

      const parachute = this.entityParachutes.get(entity);
      if (parachute !== undefined) {
        this.entityParachutes.delete(entity);
        this.parachuteLayer.remove(parachute);

        lodSystem.removeEntity(parachute);
        Parachute.free(parachute);
      }
    });
    this.removedEntities = [];

    while (this.undroppedEntities.length) {
      const entity = this.undroppedEntities.shift();
      const { arrival } = entity;
      const position = grid.indexToPosition(
          arrival.tileIndex, intermediateVector2);
      const parachute = Parachute.allocate();

      parachute.setup(game);
      parachute.position.x = position.x;
      parachute.position.y = position.y;
      parachute.carry(entity);

      lodSystem.addEntity(parachute);

      this.entityParachutes.set(entity, parachute);
      this.parachuteLayer.add(parachute);

      arrival.droppedAt(tick);

      if (this.shadowedEntities.has(entity)) {
        const shadow = new LandingShadow();

        // The parachute falls straight down, so the shadow can simply sit at
        // the same spot on the surface of the tile below it.
        shadow.position.set(
            position.x, position.y, grid.cellSize / 4.0);

        this.entityShadows.set(entity, shadow);
        this.parachuteLayer.add(shadow);
      }

      this.droppingEntities.push(entity);
    }

    for (let i = 0; i < this.droppingEntities.length; ++i) {
      const entity = this.droppingEntities[i];
      const { arrival } = entity;
      const parachute = this.entityParachutes.get(entity);

      const frameDelta = tick - arrival.droppedTick;
      const time = frameDelta / this.frameCount;

      const floor = parachute.size + grid.cellSize / 4.0;
      const position = this.dropHeight - time * this.dropHeight;

      parachute.position.z = position + floor;
      parachute.rotation.y = 0.1 * Math.sin(position / (0.35 * this.dropHeight) * Math.PI);

      // Driven by the same fraction as the descent, so the shadow reaches full
      // size exactly as the elf's feet reach the tile.
      const shadow = this.entityShadows.get(entity);

      if (shadow !== undefined) {
        shadow.progress = time;
      }

      if (frameDelta >= this.frameCount) {
        arrival.arrive();

        this.droppingEntities.splice(i--, 1);
        this.entityParachutes.delete(entity);
        this.parachuteLayer.remove(parachute);

        // The elf is standing on the tile now, so the hint has done its job.
        this.removeShadow(entity);

        lodSystem.removeEntity(parachute);
        Parachute.free(parachute);
      }
    }
  }
}
