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
import { constants, rotate2d } from '../shader-partials.js';

const {
  Mesh,
  Object3D,
  CylinderBufferGeometry,
  RawShaderMaterial,
  Vector2
} = self.THREE;

const vertexShader = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float opacity;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying vec3 vPosition;
varying float vOpacity;

${constants}
${rotate2d}

void main() {
  vUv = uv;

  vec3 finalPosition = position;

  finalPosition.xy = rotate2d(PI / 2.0, finalPosition.xy);
  finalPosition.xz = rotate2d(PI / -2.0, finalPosition.xz);

  vPosition = position;
  vOpacity = opacity;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
}`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;
varying float vOpacity;

void main() {
  vec2 halfUv = abs(vUv - 0.5);

  float alpha = pow(length(halfUv), 3.0);

  if (vPosition.y < 0.0) {
    alpha = min(0.0, 0.5 - vPosition.y);
  }

  gl_FragColor = vec4(0.6, 0.9, 1.0, (alpha * 0.9 + 0.1) * vOpacity);
}`;

const intermediateVector2 = new Vector2();

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

export class Iceberg extends AllocatableEntityObject3D {
  setup(game) {
    const { mapSystem } = game;
    const { grid } = mapSystem;
    const { cellSize } = grid;
    const radius = cellSize / 2.0;

    this.startTick = game.tick;

    if (this.graphic == null ||
        this.graphic.geometry.parameters.radiusTop !== radius) {

      if (this.graphic != null) {
        this.remove(this.graphic);
      }

      const uniforms = {
        opacity: {
          value: 0
        }
      };
      const geometry = new CylinderBufferGeometry(radius, radius, radius, 6);
      const material = new RawShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        transparent: true,
        side: 2
      });
      const graphic = new Mesh(geometry, material);

      // NOTE(cdata): This is important so that any children contained "inside"
      // are rendered correctly. Without it, they may get discarded due to depth
      // buffer details.
      graphic.renderOrder = 1;
      this.add(graphic);
      this.graphic = graphic;
      this.uniforms = uniforms;
    }
  }

  update(game) {
    const { mapSystem } = game;
    const { grid } = mapSystem;
    const { tick, width, height } = game;
    const halfWidth = width / 2.0;
    const halfHeight = height / 2.0;
    const tickDelta = tick - this.startTick;

    intermediateVector2.set(
        this.position.x, this.position.y).normalize();

    intermediateVector2.normalize();

    this.position.x += intermediateVector2.x / 3.0;
    this.position.y += intermediateVector2.y / 3.0;

    const scale = Math.min(tickDelta / 75, 1.0);
    const diminish = scale * scale * scale;

    this.rotation.z = Math.sin(tickDelta / 500) * Math.PI;

    this.position.z = Math.cos(tickDelta / 10) *
        (grid.cellSize / 2.0) *
        (1.0 - diminish * 0.9);

    this.uniforms.opacity.value = diminish;
  }
}
