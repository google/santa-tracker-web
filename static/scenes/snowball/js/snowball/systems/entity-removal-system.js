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

import { Iceberg } from '../entities/iceberg.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const intermediateVector2 = new Vector2();

export class EntityRemovalSystem {
  constructor() {
    this.teleportingEntities = [];

    this.freezingEntities = [];
    this.frozenEntities = [];

    this.entityIcebergs = {};
    this.icebergLayer = new Object3D();
  }

  teardown(game) {
    for (let entityId in this.entityIcebergs) {
      const iceberg = this.entityIcebergs[entityId];
      iceberg.teardown(game);
      Iceberg.free(iceberg);
      this.icebergLayer.remove(iceberg);
    }

    this.entityIcebergs = {};
    this.teleportingEntities = [];
    this.freezingEntities = [];
    this.frozenEntities = [];
  }

  teleportEntity(entity) {
    if (entity.presence == null || entity.presence.exiting) {
      return;
    }

    entity.presence.exiting = true;
    this.teleportingEntities.push(entity);
  }

  freezeEntity(entity) {
    if (entity.presence == null || entity.presence.exiting) {
      return;
    }

    entity.presence.exiting = true;
    this.freezingEntities.push(entity);
  }

  update(game) {
    const { mapSystem } = game;
    const { grid, map } = mapSystem;
    const { cellSize } = grid;

    while (this.freezingEntities.length) {
      const entity = this.freezingEntities.pop();
      const iceberg = Iceberg.allocate();
      const tileIndex = grid.positionToIndex(entity.position);

      console.log('Adding iceberg');
      iceberg.setup(game);

      entity.position.set(0, 0, -16);

      iceberg.add(entity);

      grid.indexToPosition(tileIndex, iceberg.position);
      iceberg.position.y -= 32;
      iceberg.position.z += 32;

      this.entityIcebergs[entity.uuid] = iceberg;
      this.frozenEntities.push(entity);

      this.icebergLayer.add(iceberg);
    }

    if (map == null) {
      return;
    }

    const { tileRings } = map;

    for (let i = 0; i < this.frozenEntities.length; ++i) {
      const entity = this.frozenEntities[i];
      const iceberg = this.entityIcebergs[entity.uuid];
      const islandRadius = (tileRings.length + 2.0) * cellSize;

      iceberg.update(game);

      intermediateVector2.copy(iceberg.position);
      const icebergDistance = intermediateVector2.length();

      intermediateVector2.set(game.width / 2, game.height / 2);
      const screenDistance = intermediateVector2.length() + islandRadius;

      if (icebergDistance > screenDistance) {
        const { presence } = entity;

        console.log('Removing iceberg');

        iceberg.remove(entity);
        this.icebergLayer.remove(iceberg);
        delete this.entityIcebergs[entity.uuid];
        this.frozenEntities.splice(i--, 1);
        Iceberg.free(iceberg);

        presence.present = presence.exiting = false;
      }
    }

    for (let i = 0; i < this.teleportingEntities.length; ++i) {
      const entity = this.teleportingEntities[i];
      const { presence, visibility } = entity;

      const delta = performance.now() - presence.exitTime;
      const threshold = 1500;
      const elapsed = delta - threshold;

      if (elapsed < 0.0) {
        continue;
      }

      const teleportDuration = 700;
      const time = Math.min(1.0, elapsed / teleportDuration);

      const distance = time * time * grid.cellSize / 1.5;
      const opacity = 1.0 - time;

      entity.position.z = distance;

      if (visibility) {
        visibility.opacity = opacity;
      }

      if (time === 1.0) {
        this.teleportingEntities.splice(i--, 1);
        presence.present = presence.exiting = false;
      }
    }
  }
}
