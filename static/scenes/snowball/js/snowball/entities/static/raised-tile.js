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

import { Entity } from '../../../engine/core/entity.js';
import { Circle } from '../../../engine/utils/collision-2d.js';

const { Math } = self.THREE;

/**
 * @constructor
 * @implements {EntityInterface}
 */
const EntityClass = Entity();

/**
 * Raised tiles are drawn three times taller than their neighbours and are
 * impassable to elves, so they read as walls. Like a tree, a raised tile needs
 * a collider of its own for snowballs to hit it: the map itself is not
 * collidable.
 *
 * One collider is used per tile rather than one per cliff, because cliffs are
 * grown as irregular clusters and a single shape around one would also cover
 * the open ice that it wraps around.
 */
export class RaisedTile extends EntityClass {
  constructor(tileIndex, position, radius) {
    super();

    this.tileIndex = tileIndex;
    this.position = position;
    this.radius = radius;
    this.static = true;
    this.uuid = Math.generateUUID();
    this.collider = null;
  }

  setup(game) {
    this.collider = Circle.allocate(this.radius, this.position);
  }

  teardown(game) {
    Circle.free(this.collider);
    this.collider = null;
  }
};
