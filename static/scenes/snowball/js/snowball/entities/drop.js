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
import {powerupType} from '../components/powerup.js';
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

// A first aid kit rather than another wrapped present, because every colour
// combination above is a saturated box with a ribbon and a shield drop needs to
// be tellable from one at a glance, across the map, while spinning.
const caseColor = '#FFFFFF';
const crossColor = '#D93025';

// Four times the gift texture, matching the elf's. The gifts get away with 128
// because their edges are all axis-aligned bands that happen to land on texel
// boundaries; the kit's outline and cross are thin shapes whose edges are what
// the eye lands on, and at 64 texels to a face they resolved to a stair.
const textureSize = 512;
const faceSize = textureSize / 2;

// Proportions of one face, so the artwork survives a change to `textureSize`.
const outlineRatio = 5 / 64;
const armLengthRatio = 22 / 64;     // half the cross's span
const armThicknessRatio = 9 / 64;   // half a bar's width

/**
 * Paints the shield drop: a white case edged in red, with a red cross on its
 * four sides.
 *
 * Where the cross goes is dictated by the cube's UVs, which are hand-authored
 * above and are not as arbitrary as they look. They only ever address the left
 * half of the texture, and they split it in two: the four faces that spin past
 * the camera all read v 0..0.5, while the two faces on the spin axis read
 * v 0.5..1. Textures upload with `flipY`, so v 0..0.5 is the *bottom* half of
 * the canvas. Painting the cross into that half therefore marks exactly the
 * four sides and leaves the ends clean.
 *
 * The same split is why the gift wrapping works: its vertical ribbon spans the
 * full height and so wraps all four sides, while its horizontal ribbon sits a
 * quarter of the way down and crosses only the two ends, exactly as a real
 * present is wrapped.
 */
export const generateFirstAidTexture = (() => {
  // Its own canvas, never repainted, so unlike `generateDropTexture` this can
  // hand the canvas straight to the texture. That sidesteps the round trip
  // through `toDataURL` and an `img`, whose decode does not finish before the
  // first `needsUpdate` and leaves the very first drop of a given colour
  // briefly untextured.
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = canvas.height = textureSize;

  context.fillStyle = caseColor;
  context.fillRect(0, 0, textureSize, textureSize);

  context.fillStyle = crossColor;

  // The UVs never read past u 0.5, so the right half is dead space. Flooding it
  // means that when a distant, mipmapped drop samples across the seam it pulls
  // the outline's red rather than bare white.
  context.fillRect(faceSize, 0, faceSize, textureSize);

  /** Edges one face-sized quadrant, which is to say one group of faces. */
  const outlineWidth = faceSize * outlineRatio;
  const outline = (x, y) => {
    context.fillRect(x, y, faceSize, outlineWidth);
    context.fillRect(x, y + faceSize - outlineWidth, faceSize, outlineWidth);
    context.fillRect(x, y, outlineWidth, faceSize);
    context.fillRect(x + faceSize - outlineWidth, y, outlineWidth, faceSize);
  };

  outline(0, faceSize);  // the four sides
  outline(0, 0);         // the two ends

  // Centre of the quadrant the four side faces sample.
  const centerX = faceSize / 2;
  const centerY = faceSize + faceSize / 2;
  const armLength = faceSize * armLengthRatio;
  const armThickness = faceSize * armThicknessRatio;

  context.fillRect(
      centerX - armThickness, centerY - armLength,
      armThickness * 2, armLength * 2);
  context.fillRect(
      centerX - armLength, centerY - armThickness,
      armLength * 2, armThickness * 2);

  return () => canvas;
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

  /**
   * A drop looks like whatever is inside it. The contents are pushed onto
   * `contents` by the drop system a moment later, but the appearance has to be
   * settled here, while the model is being set up.
   */
  onAllocated(containedItem = powerupType.BIG_SNOWBALL) {
    if (containedItem === powerupType.SHIELD) {
      // Fixed, and nearly cubic, where the gifts are deliberately irregular: a
      // first aid kit reads as standard issue, and square faces keep the cross
      // from being stretched into a lopsided one.
      this.model.scale.set(15, 15, 13);
      this.model.material.map.image = generateFirstAidTexture();
    } else {
      this.model.scale.set(Math.random() * 7 + 12, Math.random() * 7 + 12, Math.random() * 5 + 10);
      this.model.material.map.image = generateDropTexture(...randomValue(colorCombos));
    }

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
