/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

const vertexShader = `
uniform float spriteSize;
uniform float devicePixelRatio;
attribute float spriteIndex;
varying float vSpriteIndex;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  vSpriteIndex = spriteIndex;  // passed through without modification
  gl_PointSize = spriteSize * devicePixelRatio;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float spritesPerRow;
uniform sampler2D textures[1];
varying float vSpriteIndex;

void main() {
  if (vSpriteIndex < 0.0) {
    discard;  // used to indicate no sprite
  }

  float row = floor(vSpriteIndex / spritesPerRow);
  float col = (vSpriteIndex - (row * spritesPerRow));

  float factor = (1.0 / spritesPerRow);
  vec2 upperLeftTC = vec2(factor * col, factor * row);
  vec2 pos = upperLeftTC + gl_PointCoord * factor;

  vec4 startColor = vec4(1.0, 1.0, 1.0, 1.0);
  vec4 finalColor = texture2D(textures[0], pos);

  if (finalColor.a < 0.1) {
    discard;  // sanity discard if blend mode is bad
  }

  gl_FragColor = startColor * finalColor;
}
`;

const spriteSize = 128;

export class Points extends THREE.Object3D {
  constructor(points, texture) {
    super();

    this._points = points;
    this._texture = texture;

    const uniforms = {
      'spritesPerRow': {
        type: 'f',
        value: 4,
      },
      'textures': {
        type: 'tv',
        value: [texture],
      },
      'spriteSize': {
        type: 'f',
        value: spriteSize,
      },
      'devicePixelRatio': {
        type: 'f',
        value: window.devicePixelRatio,
      },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    material.extensions.fragDepth = true;
    material.fog = true;
    material.flatShading = true;
    this._material = material;

    const geometry = new THREE.BufferGeometry();

    // as the whole Geometry is at a specific position, must specify point location
    this._offsets = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    this._sprites = new THREE.BufferAttribute(new Float32Array(points), 1);
    this._offsets.setUsage(THREE.DynamicDrawUsage);
    this._sprites.setUsage(THREE.DynamicDrawUsage);

    geometry.setAttribute('position', this._offsets);
    geometry.setAttribute('spriteIndex', this._sprites);

    for (let i = 0; i < points; ++i) {
      this._offsets.setXYZ(i, 0, 0, 0);
      this._sprites.setX(i, -1);
    }
    this._used = 0;
    this._free = [];

    const particles = new THREE.Points(geometry, material);
    particles.sortParticles = true;
    particles.frustumCulled = false;

    this._updateLow = -1;
    this._updateHigh = -1;

    this._knownDPI = window.devicePixelRatio || 1;

    this.add(particles);
  }

  _next() {
    if (this._free.length) {
      return this._free.pop();
    } else if (this._used < this._points) {
      const out = this._used;
      ++this._used;
      return out;
    }
    throw new Error(`can't allocate new ID, no free from ${this._points} ${this._free.length}`)
  }

  _growUpdate(i) {
    if (this._updateLow === -1) {
      this._updateLow = i;
      this._updateHigh = i + 1;
    } else if (i < this._updateLow) {
      this._updateLow = i;
    } else if (i >= this._updateHigh) {
      this._updateHigh = i + 1;
    }
  }

  free(i) {
    if (i >= this._used || i < 0 || this._free.indexOf(i) !== -1) {
      throw new Error(`can't free unused item: ${i}`);
    }
    this._sprites.setX(i, -1);
    this._free.push(i);
    this._growUpdate(i);
  }

  alloc(x, y, sprite) {
    const i = this._next();

    // this probably isn't right, because the sprite is zoomed, but 25% from bottom works fine here
    const fromGround = 72;
    this._offsets.setXYZ(i, y, fromGround, -x);
    this._sprites.setX(i, sprite);
    this._growUpdate(i);

    return i;
  }

  update() {
    const updateDPI = window.devicePixelRatio;
    if (this._knownDPI !== updateDPI) {
      this._material.uniforms['devicePixelRatio'].value = updateDPI;
      this._knownDPI = updateDPI;
    }

    if (this._updateLow === -1) {
      return;
    }

    // nb. offset/count is in total size, hence * 3
    this._offsets.updateRange.offset = this._updateLow * 3;
    this._offsets.updateRange.count = (this._updateHigh - this._updateLow) * 3;
    this._sprites.updateRange.offset = this._updateLow;
    this._sprites.updateRange.count = (this._updateHigh - this._updateLow);

    this._updateLow = -1;
    this._updateHigh = -1;

    if (false) {
      const used = this._used - this._free.length;
      const p = (v) => {
        if (!isFinite(v)) {
          return 'Inf%';
        }
        return `${(v * 100).toFixed(2)}%`;
      };
      console.info(`used ${p(used / this._points)}, ${p(this._free.length / used)} freed`);
    }

    this._offsets.needsUpdate = true;
    this._sprites.needsUpdate = true;
  }
}
