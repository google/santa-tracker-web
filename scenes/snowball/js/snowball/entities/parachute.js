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
import { Allocatable } from '../../engine/utils/allocatable.js';
import { Point } from '../../engine/utils/collision-2d.js';
import { parachute } from '../textures.js';

const {
  Object3D,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Vector3
} = self.THREE;

/**
 * @constructor
 * @extends {THREE.Object3D}
 * @implements {EntityInterface}
 */
const EntityObject3D = Entity(Object3D);

/**
 * @constructor
 * @extends {EntityObject3D}
 * @implements {AllocatableInterface}
 */
const AllocatableEntityObject3D = Allocatable(EntityObject3D);

export class Parachute extends AllocatableEntityObject3D {
  constructor() {
    super();

    const size = 64;
    const geometry = new PlaneBufferGeometry(size, size);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true
    });
    const dolly = new Object3D();

    dolly.position.z = -size - 20.0; // NOTE(cdata): Magic number here..
    this.add(dolly);
    this.dolly = dolly;

    const graphic = new Mesh(geometry, material);

    graphic.rotation.x += Math.PI / 6;
    this.add(graphic);
    this.graphic = graphic;

    this.size = size;
    this.collider = Point.allocate(this.position);
  }

  setup(game) {
    if (this.graphic.material.map == null) {
      this.graphic.material.map = parachute(game.assetBaseUrl);
      this.graphic.material.needsUpdate = true;
    }
  }

  set lod(value) {
    if (this.carriedObject) {
      this.carriedObject.lod = value;
    }
  }

  onFreed() {
    this.dolly.remove(this.carriedObject);
    this.carriedObject = null;
  }

  carry(object) {
    object.position.set(0, 0, 0);

    this.carriedObject = object;
    this.dolly.add(object);
  }
}
