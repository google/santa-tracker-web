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

import { Entity } from '../../engine/core/entity.js';

const {
  Mesh,
  ShapeBufferGeometry,
  Shape,
  Path,
  MeshBasicMaterial
} = self.THREE;

/**
 * @constructor
 * @extends {THREE.Mesh}
 * @implements {EntityInterface}
 */
const EntityMesh = Entity(Mesh);

export class PlayerMarker extends EntityMesh {
  constructor(radius = 15.0, thickness = 4.0, color = 0x22cc88) {
    const arc = new Shape();
    arc.moveTo(0, 0);
    arc.absarc(0, 0, radius, 0, Math.PI * 2, false);

    const hole = new Path();
    hole.moveTo(0, 0);
    hole.absarc(0, 0, radius - thickness, 0, Math.PI * 2, true);

    arc.holes.push(hole);

    super(new ShapeBufferGeometry(arc), new MeshBasicMaterial({
      color,
      opacity: 0.5,
      transparent: true
    }));
  }
};
