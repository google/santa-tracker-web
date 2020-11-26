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
    this.parachuteLayer = new Object3D();
  }

  dropEntity(entity) {
    if (entity.arrival == null) {
      return;
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

  teardown() {
    this.undroppedEntities.forEach((entity) => this.removeEntity(entity));
    this.droppingEntities.forEach((entity) => this.removeEntity(entity));
  }

  update(game) {
    const { lodSystem, mapSystem, tick } = game;
    const { grid } = mapSystem;

    this.removedEntities.forEach((entity) => {
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

      if (frameDelta >= this.frameCount) {
        arrival.arrive();

        this.droppingEntities.splice(i--, 1);
        this.entityParachutes.delete(entity);
        this.parachuteLayer.remove(parachute);

        lodSystem.removeEntity(parachute);
        Parachute.free(parachute);
      }
    }
  }
}
