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
import { snowball } from '../textures.js';

const {
  Points,
  RawShaderMaterial,
  BufferGeometry,
  BufferAttribute
} = self.THREE;

const vertexShader = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

vec2 rotate2d(float angle, vec2 v){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle)) * v;
}

uniform sampler2D map;
uniform float time;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(map, vUv);
  gl_FragColor = color;
}
`;

// FIXME(cdata): Closure Compiler complains that it cannot infer the type of a method call
// in the 'extends' slot of a class. So we just save it to a variable first.
const tmpAlloc = Allocatable(Entity(Points));
class Snowsplat extends tmpAlloc {
  constructor(particleCount = 5) {
    const uniforms = {
      map: {
        value: snowball
      },
      time: {
        value: 0
      }
    };

    const geometry = new BufferGeometry();
    const sizes = new Float32Array(particleCount);
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; ++i) {
      sizes[i] = Math.random();
    }

    geometry.addAttribute('size', new BufferAttribute(sizes, 1));
    geometry.addAttribute('position', new BufferAttribute(positions, 3));

    super();

    this.uniforms = uniforms;
  }

  update(game) {
    this.uniforms.time.value = game.clockSystem.time;
  }
}
