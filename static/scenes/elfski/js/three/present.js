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

// const {
//   Object3D,
//   Mesh,
//   Texture,
//   BufferGeometry,
//   MeshBasicMaterial,
//   BufferAttribute
// } = self.THREE;


const geometry = new THREE.BufferGeometry();

// NOTE(cdata): Copied these out of Blender because I was struggling to do the
// UV mapping by hand. Should be doable though Maybe try again eventually, or
// never.
const normals = new THREE.BufferAttribute(new Float32Array([
  -1,0,-0,-1,0,-0,-1,0,-0,0,-0.0,-1,0,-0.0,-1,0,-0.0,-1,1,-0,0,1,-0,0,1,-0,0,0,0.0,1,0,0.0,1,0,0.0,1,0,-1,0.0,0,-1,0.0,0,-1,0.0,0,1,-0.0,0,1,-0.0,0,1,-0.0,-1,0,0,-0,-0.0,-1,1,0,0,-0,0.0,1,0,-1,0.0,0,1,-0.0
]), 3);

const uvs = new THREE.BufferAttribute(new Float32Array([
  0.0,0.0,0.5,0.5,0.0,0.5,0,0,0.5,0.5,0,0.5,0.5,0.5,0,0,0.5,0,0.5,0.5,0,0,0.5,0,0,1,0.5,0.5,0.5,1,0,1,0.5,0.5,0.5,1,0.5,0.0,0.5,0,0,0.5,0,0.5,0,0.5,0,0.5
]), 2);

const positions = new THREE.BufferAttribute(new Float32Array([
  -0.5,0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,-0.5,0.5,0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,0.5,-0.5,-0.5,0.5,0.5,-0.5,0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,-0.5,-0.5,-0.5,0.5,-0.5,0.5,0.5,0.5,0.5,0.5,-0.5,-0.5,0.5,-0.5,0.5,0.5,-0.5,0.5,0.5,0.5,-0.5,0.5,0.5,0.5,-0.5,0.5,-0.5,0.5,0.5
]), 3);

const indices = new THREE.BufferAttribute(new Uint16Array([
  0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,0,18,1,3,19,4,6,20,7,9,21,10,12,22,13,15,23,16
]), 1);

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
  bluePurple: ['#4EB3EA', '#87488F'],
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

const k = Object.keys(colorCombos);
export function randomColorCombo() {
  const choice = ~~(Math.random() * k.length);
  return colorCombos[k[choice]];
}


export class Present extends THREE.Object3D {
  constructor() {
    super();

    const material = new THREE.MeshPhongMaterial({map: new THREE.Texture(), transparent: true});
    this._model = new THREE.Mesh(geometry, material);
    this.add(this._model);

    this._model.scale.set(
        Math.random() * 7 + 12,
        Math.random() * 7 + 12,
        Math.random() * 5 + 10);

    const colorCombo = randomColorCombo();
    this._model.material.map.image = generateDropTexture(colorCombo[0], colorCombo[1]);
    this._model.material.map.needsUpdate = true;
    this._model.rotation.y = Math.random() * Math.PI * 2;

    this._time = Math.random() * Math.PI * 2;
    this._dir = (Math.random() > 0.5 ? -1 : +1);

    this._pickupAt = 0;
  }

  /**
   * @return {boolean} whether already collected
   */
  get collected() {
    return Boolean(this._pickupAt);
  }

  /**
   * Indicate that this has been picked up.
   * @return {boolean} whether it was picked up
   */
  pickup() {
    if (!this._pickupAt) {
      this._pickupAt = this._time;
      return true;
    }
    return false;
  }

  /**
   * @param {number} delta
   * @return {boolean} whether this should remain
   */
  tick(delta) {
    this._time += delta;
    this._model.rotation.y += (delta * Math.PI) * this._dir / 4;
    this._model.position.y = 24 + Math.sin(this._time) * 4;

    if (this._pickupAt) {
      const scale = 1 - ((this._time - this._pickupAt) * 2);
      if (scale <= 0) {
        return false;
      }
      // can't change model, we already abuse its scale
      this.scale.set(scale, scale, scale);
    }

    return true;
  }
};
