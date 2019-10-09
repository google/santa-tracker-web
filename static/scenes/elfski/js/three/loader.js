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

const gltfLoader = new THREE.GLTFLoader();
const textureLoader = new THREE.TextureLoader();

gltfLoader.setCrossOrigin('anonymous');
textureLoader.crossOrigin = 'anonymous';

export function gltf(path, base='.') {
  return new Promise((resolve, reject) => {
    gltfLoader.load(`${base}models/${path}.gltf`, resolve, () => {}, reject);
  });
}

export function texture(path, base='.', cb=null) {
  return new Promise((resolve, reject) => {
    const texture = textureLoader.load(`${base}img/${path}.png`, resolve, () => {}, reject);
    cb && cb(texture);
  });
}

export function immediateTexture(path, base='.') {
  let out;
  texture(path, base, (texture) => out = texture);
  return out;
}