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
import {shieldGift} from '../textures.js';

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

// The four side faces share one quadrant of the texture, but as authored they
// disagree on which way up it goes: the -x and -z faces (vertices 0-2 and 18,
// and 3-5 and 19) show it rotated a half turn from the +x and +z faces. The
// wrapped gifts never showed it, because their vertical ribbon looks the same
// either way up, but the shield on the shield gift would stand on its point on
// two of the four sides. Turning those two faces' coordinates about the centre
// of the quadrant puts all four the same way up.
[0, 1, 2, 18, 3, 4, 5, 19].forEach(index => {
  uvs.setXY(index, 0.5 - uvs.getX(index), 0.5 - uvs.getY(index));
});

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

/*
 * The shield gift is a white case edged in green, with a green shield on its
 * four sides -- the shield from `js/images/icons.png`, narrowed and recoloured
 * to the rim of the shield bubble it grants. Every colour combination above is
 * a saturated box with a ribbon, and a shield drop needs to be tellable from
 * one at a glance, across the map, while spinning.
 *
 * Its texture is a real image, `img/shield-gift.png` (see `textures.js`), laid
 * out to suit the cube's UVs, which are hand-authored above and are not as
 * arbitrary as they look. They only ever address the left half of the
 * texture, and they split it in two: the four faces that spin past the camera
 * all read v 0..0.5, while the two faces on the spin axis read v 0.5..1.
 * Textures upload with `flipY`, so in the image file:
 *
 *   - bottom-left quadrant: the four sides (outline and shield), upright;
 *   - top-left quadrant: the two ends (outline only);
 *   - right half: never sampled. It is flooded with the outline colour so that
 *     a distant, mipmapped drop sampling across the seam pulls green, not white.
 *
 * The same split is why the gift wrapping works: its vertical ribbon spans the
 * full height and so wraps all four sides, while its horizontal ribbon sits a
 * quarter of the way down and crosses only the two ends, exactly as a real
 * present is wrapped.
 */

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
    // Each drop owns its gift texture, which is repainted with that gift's
    // colours whenever the drop is reused. Shield gifts all share one loaded
    // texture instead, swapped in by `setup`. Keeping a handle on this one is
    // what lets a drop that was a shield become a gift again without
    // repainting the shared shield texture.
    this.giftTexture = new Texture();
    const model =
        new Mesh(geometry, new MeshBasicMaterial({map: this.giftTexture, transparent: true}));

    this.add(model);
    this.model = model;
    this.collider = Circle.allocate(10, this.position);
  }

  /**
   * A drop looks like whatever is inside it. The contents are pushed onto
   * `contents` by the drop system a moment later, but the appearance has to be
   * settled here, while the model is being set up. The one exception is the
   * shield gift's texture, which needs `game.assetBaseUrl` to load and so is
   * applied in `setup`, before the drop is first drawn.
   */
  onAllocated(containedItem = powerupType.BIG_SNOWBALL) {
    this.isShieldGift = containedItem === powerupType.SHIELD;

    if (this.isShieldGift) {
      // Fixed, and nearly cubic, where the gifts are deliberately irregular: a
      // shield case reads as standard issue, and square faces keep the shield
      // from being stretched into a lopsided one.
      this.model.scale.set(15, 15, 13);
    } else {
      this.model.scale.set(Math.random() * 7 + 12, Math.random() * 7 + 12, Math.random() * 5 + 10);
      this.model.material.map = this.giftTexture;
      this.giftTexture.image = generateDropTexture(...randomValue(colorCombos));
      this.giftTexture.needsUpdate = true;
    }

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

    if (this.isShieldGift) {
      this.model.material.map = shieldGift(game.assetBaseUrl);
    }
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
