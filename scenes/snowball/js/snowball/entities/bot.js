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
import { Rectangle } from '../../engine/utils/collision-2d.js';

const {
  Math: ThreeMath,
  Vector3
} = self.THREE;

/**
 * @constructor
 * @implements {EntityInterface}
 */
const EntityClass = Entity();

const distance = new Vector3();

export class Bot extends EntityClass {
  setup(game) {
    const { playerSystem } = game;
    this.id = ThreeMath.generateUUID();
    this.player = playerSystem.addPlayer();
    this.player.speed.scale = 0.75;
    this.collider = Rectangle.allocate(200, 200, this.player.position);
    this.lastTarget = null;
    this.lastThrowTick = game.tick;
  }

  update(game) {
    const {
      playerSystem,
      mapSystem,
      collisionSystem,
      tick
    } = game;
    const { map, grid } = mapSystem;
    const { player, lastThrowTick } = this;
    const { path, arrival } = player;

    if (!arrival.arrived) {
      return;
    }

    if (path.destinationReached) {
      if (Math.random() > 0.985) {
        //const index = map.getRandomHabitableTileIndex();
        const index = map.getRandomNearbyPassableTileIndex(
            grid.positionToIndex(player.position), 6);

        const position = grid.indexToPosition(index);
        playerSystem.assignPlayerDestination(player.playerId, {
          index,
          position
        });
      }
    }

    const { quadTree } = collisionSystem;

    const nearbyTargets = quadTree.getObjectsNear(this);
    let nextTarget = null;

    if (this.lastTarget != null) {
      const lastTargetIndex = nearbyTargets.indexOf(this.lastTarget);

      if (lastTargetIndex > -1) {
        nextTarget = this.lastTarget;
      }
    }

    if (nextTarget == null) {
      for (let i = 0; i < nearbyTargets.length; ++i) {
        const target = nearbyTargets[i];

        if (target.playerId == null ||
            target === player ||
            target.position.length() === 0) {
          continue;
        }

        if (Math.random() > 0.25) {
          if (player.position.distanceTo(target.position) < 320) {
            nextTarget = target;
            break;
          }
        }
      }
    }

    if (nextTarget != null && (tick - lastThrowTick) > 40) {
      if (Math.random() > 0.5) {
        //console.log('Distance to next target:', player.position.clone().distanceTo(nextTarget.position));
        playerSystem.assignPlayerTargetedPosition(
            player.playerId, nextTarget.position);
      }

      this.lastThrowTick = tick;
    }

    this.lastTarget = nextTarget;
  }
}
