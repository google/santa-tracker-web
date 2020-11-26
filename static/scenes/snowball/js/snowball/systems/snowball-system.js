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

import { QuadTree } from '../../engine/utils/quad-tree.js';
import { Snowball } from '../entities/snowball.js';
import { BigSnowball } from '../entities/snowballs/big-snowball.js';
import { powerupType } from '../components/powerup.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const intermediateVector2 = new Vector2();

const snowballConstructorForType = type => {
  switch(type) {
    default:
    case powerupType.NOTHING: return Snowball;
    case powerupType.BIG_SNOWBALL: return BigSnowball;
  }
}

export class SnowballSystem {
  constructor(drag) {
    this.snowballs = [];
    this.newSnowballs = [];
    this.snowballLayer = new Object3D();

    this.drag = drag;
  }

  teardown(game) {
    const snowballs = this.newSnowballs.concat(this.snowballs);

    for (let i = 0; i < snowballs.length; ++i) {
      const snowball = snowballs[i];

      if (snowball.parent != null) {
        this.snowballLayer.remove(snowball);
      }

      snowball.teardown(game);
      snowball.constructor.free(snowball);
    }

    this.snowballs = [];
    this.newSnowballs = [];
  }

  update(game) {

    const { mapSystem, collisionSystem, effectSystem } = game;
    const { bounds } = collisionSystem;
    const { grid, map } = mapSystem;

    // NOTE(cdata): This is just for testing perf of a lot of collidable
    // objects in the scene at one time:
    //for (let i = 0; i < 32; ++i) {
      //const targetX = Math.random() * (bounds.br.x - bounds.tl.x) + bounds.tl.x;
      //const originX = Math.random() * (bounds.br.x - bounds.tl.x) + bounds.tl.x;
      //const targetY = Math.random() * (bounds.tl.y - bounds.br.y) + bounds.br.y;
      //const originY = Math.random() * (bounds.tl.y - bounds.br.y) + bounds.br.y;

      //this.throwSnowball(new Vector2(targetX, targetY), new Vector2(originX, originY));
    //}

    while (this.newSnowballs.length) {
      this.setupSnowball(this.newSnowballs.pop(), game);
    }

    for (let i = 0; i < this.snowballs.length; ++i) {
      const snowball = this.snowballs[i];

      if (snowball.collidedWith != null) {
        this.removeSnowball(snowball, game);
        continue;
      }

      snowball.update(game);

      if (snowball.thrown && snowball.presence.gone) {
        this.removeSnowball(snowball, game);
      }
    }
  }

  setupSnowball(snowball, game) {
    const { collisionSystem } = game;

    collisionSystem.addCollidable(snowball);

    this.snowballs.push(snowball);
    this.snowballLayer.add(snowball);
    snowball.setup(game);
  }

  removeSnowball(snowball, game) {
    const { collisionSystem, effectSystem } = game;

    effectSystem.snowsplatEffect.showFor(snowball);

    this.snowballs.splice(this.snowballs.indexOf(snowball), 1);
    this.snowballLayer.remove(snowball);

    collisionSystem.removeCollidable(snowball);

    snowball.teardown(game);
    snowball.constructor.free(snowball);
  }

  throwSnowball(thrower, target) {
    const { powerups } = thrower;
    const { active: powerup } = powerups;
    const type = powerup == null ? powerupType.NOTHING : powerup.type;

    powerups.decrementActiveQuantity();

    const SnowballConstructor = snowballConstructorForType(type);
    const snowball = SnowballConstructor.allocate(thrower);
    snowball.throwAt(target);
    this.newSnowballs.push(snowball);
  }
}
