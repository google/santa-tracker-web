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

import {Entity} from '../../engine/core/entity.js';
import {Allocatable} from '../../engine/utils/allocatable.js';
import {Circle} from '../../engine/utils/collision-2d.js';
import {randomValue} from '../../engine/utils/function.js';
import {Arrival} from '../components/arrival.js';
import {Contents} from '../components/contents.js';
import {Presence} from '../components/presence.js';

import {Elf} from './elf.js';

const {Object3D, Mesh, Texture, BufferGeometry, MeshBasicMaterial, BufferAttribute} = self.THREE;


const geometry = new BufferGeometry();

// NOTE(cdata): Copied these out of Blender because I was struggling to do the
// UV mapping by hand. Should be doable though Maybe try again eventually, or
// never.
const normals = new BufferAttribute(
    new Float32Array([
      -1, 0,  -0,  -1, 0,    -0,  -1, 0,  -0,  0,  -0.0, -1,   0, -0.0, -1,   0, -0.0, -1,
      1,  -0, 0,   1,  -0,   0,   1,  -0, 0,   0,  0.0,  1,    0, 0.0,  1,    0, 0.0,  1,
      0,  -1, 0.0, 0,  -1,   0.0, 0,  -1, 0.0, 0,  1,    -0.0, 0, 1,    -0.0, 0, 1,    -0.0,
      -1, 0,  0,   -0, -0.0, -1,  1,  0,  0,   -0, 0.0,  1,    0, -1,   0.0,  0, 1,    -0.0
    ]),
    3);

const uvs = new BufferAttribute(
    new Float32Array([
      0.0, 0.0, 0.5, 0.5, 0.0, 0.5, 0,   0, 0.5, 0.5, 0,   0.5, 0.5, 0.5, 0, 0,
      0.5, 0,   0.5, 0.5, 0,   0,   0.5, 0, 0,   1,   0.5, 0.5, 0.5, 1,   0, 1,
      0.5, 0.5, 0.5, 1,   0.5, 0.0, 0.5, 0, 0,   0.5, 0,   0.5, 0,   0.5, 0, 0.5
    ]),
    2);

const positions = new BufferAttribute(
    new Float32Array([
      -0.5, 0.5,  0.5,  -0.5, -0.5, -0.5, -0.5, -0.5, 0.5,  -0.5, 0.5,  -0.5, 0.5,  -0.5, -0.5,
      -0.5, -0.5, -0.5, 0.5,  0.5,  -0.5, 0.5,  -0.5, 0.5,  0.5,  -0.5, -0.5, 0.5,  0.5,  0.5,
      -0.5, -0.5, 0.5,  0.5,  -0.5, 0.5,  0.5,  -0.5, -0.5, -0.5, -0.5, 0.5,  -0.5, -0.5, -0.5,
      -0.5, 0.5,  -0.5, 0.5,  0.5,  0.5,  0.5,  0.5,  -0.5, -0.5, 0.5,  -0.5, 0.5,  0.5,  -0.5,
      0.5,  0.5,  0.5,  -0.5, 0.5,  0.5,  0.5,  -0.5, 0.5,  -0.5, 0.5,  0.5
    ]),
    3);

const indices = new BufferAttribute(
    new Uint16Array([
      0, 1,  2, 3, 4,  5, 6, 7,  8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      0, 18, 1, 3, 19, 4, 6, 20, 7, 9, 21, 10, 12, 22, 13, 15, 23, 16
    ]),
    1);

geometry.setAttribute('position', positions);
geometry.setAttribute('uv', uvs);
geometry.setAttribute('normal', normals);
geometry.setIndex(indices);

export const colorCombos = {
  yellowRed: ['#FADE4B', '#BE584A'],
  redYellow: ['#BE584A', '#FADE4B'],
  orangeBlue: ['#E68F49', '#4EB3EC'],
  yellowBlue: ['#FADF4B', '#4EB3EC'],
  purpleGreen: ['#87488F', '#67B783'],
  purpleYellow: ['#87488F', '#FADF4B'],
  bluePurple: ['#4EB3EA', '#87488F']
};

export const generateDropTexture = (() => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const TWO_PI = Math.PI * 2.0;
  const cache = {};

  canvas.width = canvas.height = 128;

  return (majorColor, minorColor) => {
    const cacheKey = `${majorColor}_${minorColor}`;

    if (cache[cacheKey] != null) {
      return cache[cacheKey];
    }

    context.fillStyle = majorColor;
    context.fillRect(0, 0, 128, 128);
    context.fillStyle = minorColor;
    context.fillRect(24, 0, 16, 128);
    context.fillRect(0, 24, 128, 16);

    const image = document.createElement('img');
    image.src = canvas.toDataURL();
    cache[cacheKey] = image;
    return image;
  };
})();

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

export class Drop extends AllocatableEntityObject3D {
  constructor() {
    super();
    const model =
        new Mesh(geometry, new MeshBasicMaterial({map: new Texture(), transparent: true}));

    this.add(model);
    this.model = model;
    this.collider = Circle.allocate(10, this.position);
  }

  onAllocated(colorCombo = randomValue(colorCombos)) {
    this.model.scale.set(Math.random() * 7 + 12, Math.random() * 7 + 12, Math.random() * 5 + 10);

    this.model.material.map.image = generateDropTexture(...colorCombo);
    this.model.material.map.needsUpdate = true;

    this.arrival = new Arrival();
    this.contents = new Contents();
    this.presence = new Presence();
    this.spinTime = -1;
  }

  setup(game) {
    const {mapSystem, collisionSystem} = game;
    const {grid} = mapSystem;

    this.collidingPlayer = null;
    this.model.rotation.set(Math.PI / 2.5, 0, 0);
    this.model.position.z = grid.cellSize / 2.0;
    this.model.material.opacity = 1.0;
    this.unsubscribe = collisionSystem.handleCollisions(this, (drop, other) => {
      if (this.collidingPlayer == null && !this.presence.exiting && other instanceof Elf) {
        this.collidingPlayer = other;
      }
    });
  }

  teardown(game) {
    this.collidingPlayer = null;

    if (this.unsubscribe != null) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  update(game) {
    const {mapSystem} = game;
    const {grid} = mapSystem;
    const {presence} = this;

    if (!presence.exiting) {
      this.model.rotation.y += 0.01;
    } else {
      if (this.spinTime > -1) {
        const duration = 300;
        const elapsed = performance.now() - this.spinTime;
        const timeScale = Math.min(elapsed / duration, 1.0);
        const spinDelta = -1 * (Math.pow(timeScale - 1.0, 4) + Math.pow(timeScale - 1.0, 3));

        this.model.rotation.y += spinDelta * 2.0 * Math.PI;
        this.model.position.z += spinDelta * (grid.cellSize);
        this.model.scale.multiplyScalar(Math.max(1.0, 1.0 + spinDelta));
        this.model.material.opacity = Math.max(1.0 - timeScale, 0.0);

        if (timeScale === 1.0) {
          presence.present = false;
          presence.exiting = false;
        }
      } else {
        this.model.rotation.y = 0;
        this.model.rotation.x = Math.PI / 2.0;
      }
    }
  }

  spin() {
    // TODO: animation
    this.presence.exiting = true;
    this.presence.present = true;
    this.spinTime = performance.now();
  }
};
