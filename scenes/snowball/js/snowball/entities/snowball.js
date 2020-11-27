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
import { Point, Circle } from '../../engine/utils/collision-2d.js';
import { Allocatable } from '../../engine/utils/allocatable.js';
import { snowball } from '../textures.js';
import { Trail } from '../components/trail.js';
import { Trajectory } from '../components/trajectory.js';
import { Presence } from '../components/presence.js';
import { Splat } from '../components/splat.js';

const {
  Mesh,
  Vector2,
  BoxGeometry,
  MeshBasicMaterial,
  RawShaderMaterial,
  PlaneBufferGeometry
} = self.THREE;

const PI_OVER_TWELVE = Math.PI / 12.0;
const PI_OVER_SIX = Math.PI / 6.0;
const PI_OVER_TWO = Math.PI / 2.0;
const path = new Vector2();

const vertexShader = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float random;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying float vRandom;

void main() {
  vUv = uv;
  vRandom = random;
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
varying float vRandom;

void main() {
  float elapsed = time / (1000.0 + 5000.0 * vRandom);
  vec2 halfUv = vec2(0.5);
  vec2 rUv = rotate2d(elapsed * 3.14159 * 2.0, vUv - halfUv) + halfUv;
  vec4 color = texture2D(map, rUv);

  color -= vec4(0.05, 0.015, 0.0, 0.0) * cos(time / 30.0 * vRandom);

  gl_FragColor = color;
}
`;

/**
 * @constructor
 * @extends {THREE.Mesh}
 * @implements {EntityInterface}
 */
const EntityMesh = Entity(Mesh);

/**
 * @constructor
 * @extends {EntityMesh}
 * @implements {AllocatableInterface}
 */
const AllocatableEntityMesh = Allocatable(EntityMesh);

export class Snowball extends AllocatableEntityMesh {
  constructor(size = 12) {
    const uniforms = {
      map: {
        value: null
      },
      time: {
        value: 0
      },
      random: {
        value: Math.random()
      }
    };

    super(new PlaneBufferGeometry(size, size),
        new RawShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          side: 2,
          transparent: true
        }));

    this.size = size;
    this.uniforms = uniforms;
    this.collider = Circle.allocate(size / 2, this.position);

    this.trail = new Trail(size / 2, 0xaaccff, game => this.thrown);

    this.trajectory = new Trajectory();
    this.splat = new Splat(this.position);
  }

  onAllocated(thrower) {
    this.trajectory.origin.copy(thrower.position);
    this.trajectory.targetPosition.set(0, 0);
    this.thrower = thrower;
    this.visible = false;
    this.thrown = false;

    this.position.copy(this.trajectory.origin);
    this.tickWhenThrown = -1;
    this.skew = 0;
    this.collidedWith = null;
    this.presence = new Presence();
  }

  setup(game) {
    const { collisionSystem, effectSystem } = game;

    if (this.uniforms.map.value == null) {
      this.uniforms.map.value = snowball(game.assetBaseUrl);
    }

    this.unsubscribeFromCollisions = collisionSystem.handleCollisions(this,
        (snowball, collidable) => {
          if (collidable === this.thrower) {
            return;
          }
          window.santaApp.fire('sound-trigger', 'snowball_hit');

          this.collidedWith = collidable;
          this.visible = false;
        });

    effectSystem.trailEffect.add(this);
  }

  teardown(game) {
    const { effectSystem } = game;
    if (this.unsubscribeFromCollisions != null) {
      this.unsubscribeFromCollisions();
      this.unsubscribeFromCollisions = null;
    }
    effectSystem.trailEffect.remove(this);
  }

  update(game) {
    this.uniforms.time.value = game.clockSystem.time;

    if (!this.thrown) {
      return;
    } else if (this.tickWhenThrown === -1) {
      this.tickWhenThrown = game.tick;
    } else {
      this.advance(game);
    }
  }

  throwAt(target) {
    if (!this.thrown) {
      this.visible = true;
      this.thrown = true;
      this.trajectory.targetPosition.copy(target);
      this.splat.direction.subVectors(this.trajectory.targetPosition,
          this.trajectory.origin).normalize();

      // ±15º skew on the throw
      this.skew = Math.random() * PI_OVER_SIX - PI_OVER_TWELVE;
    }
  }

  advance(game) {
    const { mapSystem } = game;
    const { grid } = mapSystem;
    const { trajectory } = this;
    const tickDelta = game.preciseTick - this.tickWhenThrown;
    const maxDistance = 256;

    path.subVectors(trajectory.targetPosition, trajectory.origin)
        .clampLength(0, maxDistance);

    const maxAnimationFrames = 42;
    const durationScale = path.length() / maxDistance;
    const duration = maxAnimationFrames * durationScale;
    const time = tickDelta / duration;

    const shotAngle = path.angle();
    const arcScale = Math.abs((shotAngle % Math.PI) - PI_OVER_TWO) / PI_OVER_TWO;
    const arcSize = arcScale * arcScale *
        Math.sin(time * Math.PI) * 20.0 * durationScale;

    path.multiplyScalar(time)
      .add(trajectory.origin);

    this.position.x = path.x;
    this.position.y = path.y;
    this.position.z = grid.cellSize / 2.0 + arcSize;

    if (tickDelta >= duration) {
      this.presence.exiting = false;
      this.presence.present = false;
    }
  }

  deserialize(object) {
    Object.assign(this, object);
  }

  serialize() {
    return {
      thrown: this.thrown,
      tickWhenThrown: this.tickWhenThrown,
      skew: this.skew,
      target: {
        x: this.target.x,
        y: this.target.y
      },
      position: {
        x: this.position.x,
        y: this.position.y
      }
    };
  };
};

