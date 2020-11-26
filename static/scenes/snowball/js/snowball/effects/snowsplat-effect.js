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
import {constants, rotate2d} from '../shader-partials.js';
import {snowball} from '../textures.js';

const {
  BufferGeometry,
  BufferAttribute,
  Points,
  RawShaderMaterial,
  DynamicDrawUsage,
} = self.THREE;

const vertexShader = `

precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

attribute vec3 position;
attribute float displayTime;
attribute vec2 direction;
attribute float random;
attribute float size;

varying float vDisplayTime;

${constants}
${rotate2d}

void main() {
  vDisplayTime = displayTime;

  float timeDelta = time - vDisplayTime;
  float elapsed = min(timeDelta / 300.0, 1.0);

  float spread = PI / -3.0 * random + PI / 6.0;

  vec2 dist = rotate2d(spread, direction) * fract(random * 7.158) * 85.0 * elapsed;

  dist.y -= pow(3.0 * elapsed, 2.0);

  float halfSize = size / 2.0;
  float eighthSize = size / 8.0;

  gl_PointSize = (halfSize * random + halfSize + eighthSize) * (1.0 - elapsed);
  gl_Position = projectionMatrix * modelViewMatrix *
      vec4(position.xy + dist, position.z, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D map;
uniform float time;

varying float vDisplayTime;

void main() {
  if (vDisplayTime < 1.0) {
    discard;
  }

  float timeDelta = time - vDisplayTime;
  float elapsed = min(timeDelta / 300.0, 1.0);

  float alpha = elapsed;

  if (alpha >= 1.0) {
    discard;
  }

  vec4 color = texture2D(map, gl_PointCoord);

  if (color.a > 0.5) {
    color.a = alpha;
  }

  gl_FragColor = color;
}
`;

/**
 * @constructor
 * @implements {EntityInterface}
 */
const EntityClass = Entity();

export class SnowsplatEffect extends EntityClass {
  constructor() {
    super();

    this.nextAvailableParticle = 0;
    this.maxParticles = 2000;

    const position =
        new BufferAttribute(new Float32Array(this.maxParticles * 3), 3).setUsage(DynamicDrawUsage);

    const direction =
        new BufferAttribute(new Float32Array(this.maxParticles * 2), 2).setUsage(DynamicDrawUsage);

    const displayTime =
        new BufferAttribute(new Float32Array(this.maxParticles), 1).setUsage(DynamicDrawUsage);

    const size =
        new BufferAttribute(new Float32Array(this.maxParticles), 1).setUsage(DynamicDrawUsage);

    const random = new BufferAttribute(new Float32Array(this.maxParticles), 1);

    for (let i = 0; i < this.maxParticles; ++i) {
      random.setX(i, Math.random());
    }

    const geometry = new BufferGeometry();

    geometry.setAttribute('position', position);
    geometry.setAttribute('direction', direction);
    geometry.setAttribute('displayTime', displayTime);
    geometry.setAttribute('size', size);
    geometry.setAttribute('random', random);

    const uniforms = {time: {value: 0}, map: {value: null}};

    const material = new RawShaderMaterial(
        {vertexShader, fragmentShader, uniforms, transparent: true, depthTest: false, side: 2});

    this.uniforms = uniforms;
    this.layer = new Points(geometry, material);
    this.layer.frustumCulled = false;
    this.splats = [];
  }

  showFor(entity) {
    const {splat} = entity;

    if (splat == null) {
      return;
    }

    this.splats.push(splat);
  }

  update(game) {
    if (this.uniforms.map.value == null) {
      this.uniforms.map.value = snowball(game.assetBaseUrl);
    }

    this.uniforms.time.value = game.clockSystem.time;

    while (this.splats.length) {
      const splat = this.splats.pop();
      const remainingParticles = this.maxParticles - this.nextAvailableParticle;
      const particleIndex = remainingParticles < splat.quantity ? 0 : this.nextAvailableParticle;

      const {position, direction, displayTime, size} = this.layer.geometry.attributes;

      for (let i = 0; i < splat.quantity; ++i) {
        const index = particleIndex + i;

        position.setXYZ(index, splat.position.x, splat.position.y, splat.position.z);

        direction.setXY(index, splat.direction.x, splat.direction.y);
        displayTime.setX(index, game.clockSystem.time);
        size.setX(index, splat.size);
      }

      position.needsUpdate = direction.needsUpdate = displayTime.needsUpdate = size.needsUpdate =
          true;

      this.nextAvailableParticle =
          (this.nextAvailableParticle + splat.quantity) % this.maxParticles;
    }
  }
}
