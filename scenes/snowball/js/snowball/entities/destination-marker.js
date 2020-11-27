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

export class DestinationMarker extends EntityMesh {
  constructor(size = 10.0, color = 0x22cc88) {
    const x = new Shape();

    const armWidth = size / 3.0;
    const halfArmWidth = armWidth / 2.0;
    const armLength = size / 2.0;

    x.moveTo(-halfArmWidth, halfArmWidth);
    x.lineTo(-armLength, halfArmWidth);
    x.lineTo(-armLength, -halfArmWidth);
    x.lineTo(-halfArmWidth, -halfArmWidth);
    x.lineTo(-halfArmWidth, -armLength);
    x.lineTo(halfArmWidth, -armLength);
    x.lineTo(halfArmWidth, -halfArmWidth);
    x.lineTo(armLength, -halfArmWidth);
    x.lineTo(armLength, halfArmWidth);
    x.lineTo(halfArmWidth, halfArmWidth);
    x.lineTo(halfArmWidth, armLength);
    x.lineTo(-halfArmWidth, armLength);
    x.lineTo(-halfArmWidth, halfArmWidth);

    super(new ShapeBufferGeometry(x), new MeshBasicMaterial({
      side: 2,
      color,
      opacity: 0.5,
      transparent: true,
      // NOTE(cdata): This will cause the x to draw on top of other things:
      depthTest: false
    }));
  }

  setup(game) {
    const { mapSystem } = game;
    const { grid } = mapSystem;

    this.rotation.z = Math.PI / 4.0;
    this.position.z = grid.cellSize * 0.5;

    this.visible = false;
  }
}
