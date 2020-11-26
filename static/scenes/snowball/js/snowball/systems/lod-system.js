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


export const lod = {
  HIGH: 'high',
  LOW: 'low'
};

export class LodSystem {
  static get lod() {
    return lod;
  }

  constructor(getCollider = object => object.collider) {
    this.getCollider = getCollider;
    this.lodEntities = [];
    this.limit = null;
  }

  teardown(game) {
    this.lodEntities = [];
  }

  addEntity(entity) {
    this.lodEntities.push(entity);
  }

  removeEntity(entity) {
    const entityIndex = this.lodEntities.indexOf(entity);

    if (entityIndex > -1) {
      this.lodEntities.splice(entityIndex, 1);
    }
  }

  update(game) {
    if (this.limit == null) {
      return;
    }

    const { camera } = game;

    this.limit.position.x = camera.position.x;
    this.limit.position.y = camera.position.y * -4/3;

    for (let i = 0; i < this.lodEntities.length; ++i) {
      const entity = this.lodEntities[i];
      const bounds = this.getCollider(entity);

      if (bounds == null || this.limit.contains(bounds)) {
        entity.lod = lod.HIGH;
      } else {
        entity.lod = lod.LOW;
      }
    }
  }
};
