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
import {Circle, Rectangle} from '../../engine/utils/collision-2d.js';
import {constants, fade, shake, sink} from '../shader-partials.js';
import {tiles} from '../textures.js';

const {
  Mesh,
  Object3D,
  BufferAttribute,
  RawShaderMaterial,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  PlaneBufferGeometry
} = self.THREE;

const vertexShader = `
precision highp float;

${constants}

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float tileScale;
uniform float time;
uniform float tileHeight;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 tileOffset;
attribute vec2 tileState;
attribute float tileObstacle;

varying vec2 vUv;
varying vec2 vTileState;
varying float vTileObstacle;
varying vec3 vPosition;

${shake}
${sink}

void main() {
  vec3 offsetPosition = tileOffset * tileScale;
  vec3 scaledPosition = position * tileScale;

  scaledPosition.y += tileHeight / 2.0;

  vec3 finalPosition = shake(tileState, time, scaledPosition + offsetPosition);
  finalPosition = sink(tileState, time, finalPosition);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);

  vec2 uvOffset = vec2(mod(tileObstacle, 4.0), (3.0 - floor(tileObstacle / 4.0))) / 4.0;
  vUv = uvOffset + uv / 4.0;
  vPosition = position;
  vTileState = tileState;
  vTileObstacle = tileObstacle;
}
`;

const fragmentShader = `
precision highp float;

uniform float scale;
uniform float time;
uniform sampler2D map;

varying vec2 vUv;
varying vec2 vTileState;
varying float vTileObstacle;
varying vec3 vPosition;

${fade}

void main() {
  if (vTileState.x < 1.0 || vTileObstacle < 0.0) {
    discard;
  }

  vec4 color = texture2D(map, vUv);

  vec2 border = mod(vUv, 0.25);

  #ifdef debug

  if (border.x > 0.0 && border.x < 0.01 || border.x > 0.24 && border.x < 0.25 || border.y > 0.0 && border.y < 0.01 || border.y > 0.24 && border.y < 0.25) {
    color = vec4(1.0, 0.0, 0.0, 0.25);
  }

  #endif

  color.a *= fade(vTileState, time);

  if (color.a < 0.1) {
    discard;
  }

  gl_FragColor = color;
}
`;

const orientationMesh = new Mesh();

orientationMesh.rotation.x += Math.PI / 6.0;
orientationMesh.updateMatrix();

/**
 * @constructor
 * @extends {THREE.Object3D}
 * @implements {EntityInterface}
 */
const EntityObject3D = Entity(Object3D);

export class Obstacles extends EntityObject3D {
  setup(game) {
    const {mapSystem} = game;
    const {grid} = mapSystem;

    const uniforms = {
      time: {value: 0},
      map: {value: tiles(game.assetBaseUrl)},
      tileScale: {value: grid.cellSize},
      tileHeight: {value: grid.cellHeight}
    };

    const planeGeometry = new PlaneBufferGeometry(2.0, 2.0);

    const geometry = new InstancedBufferGeometry();
    const material =
        new RawShaderMaterial({vertexShader, fragmentShader, uniforms, transparent: true});

    planeGeometry.applyMatrix(orientationMesh.matrix);

    Object.assign(geometry.attributes, planeGeometry.attributes);
    geometry.setIndex(planeGeometry.index);
    this.geometry = geometry;

    const mesh = new Mesh(geometry, material);

    mesh.position.x -= grid.pixelWidth / 2.0;
    mesh.position.y += grid.pixelHeight / 2.0;
    mesh.position.z = grid.cellSize * 0.75;
    mesh.frustumCulled = false;

    this.add(mesh);
    this.mesh = mesh;

    this.uniforms = uniforms;
  }

  update(game) {
    this.uniforms.time.value = performance.now();
  }

  get map() {
    return this._map;
  }

  set map(map) {
    this._map = map;

    const geometry = this.geometry;
    if (map) {
      geometry.setAttribute('tileOffset', map.tileOffsets);
      geometry.setAttribute('tileState', map.tileStates);
      geometry.setAttribute('tileObstacle', map.tileObstacles);
    } else {
      geometry.removeAttribute('tileOffset');
      geometry.removeAttribute('tileState');
      geometry.removeAttribute('tileObstacle');
    }
  }
}
