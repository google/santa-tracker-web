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
import { Circle, Rectangle } from '../../../engine/utils/collision-2d.js';

const { Math } = self.THREE;

/**
 * @constructor
 * @implements {EntityInterface}
 */
const EntityClass = Entity();

export class Tree extends EntityClass {
  constructor(tileIndex, position) {
    super();

    this.tileIndex = tileIndex;
    this.position = position;
    this.position.y += 15;
    this.static = true;
    this.uuid = Math.generateUUID();
    this.collider = null;
  }

  setup(game) {
    this.collider = Circle.allocate(14, this.position);
    //this.collider = Rectangle.allocate(24, 32, this.position);
  }

  teardown(game) {
    Circle.free(this.collider);
    this.collider = null;
  }
};
