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
import { powerupType } from '../components/powerup.js';

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

/**
 * Whether `drop` is a shield gift, still lying on `tileIndex`, that an elf
 * could walk over and collect.
 */
const isCollectableShield = (drop, tileIndex, map) => {
  const { arrival, presence, contents } = drop;

  return arrival.arrived && arrival.tileIndex === tileIndex &&
      !presence.exiting && !presence.gone &&
      contents.inventory[0] === powerupType.SHIELD &&
      map.isTraversable(tileIndex);
};

export class Bot extends EntityClass {
  setup(game) {
    const { playerSystem } = game;
    this.id = ThreeMath.generateUUID();
    this.player = playerSystem.addPlayer();
    this.player.speed.scale = 0.75;
    this.collider = Rectangle.allocate(200, 200, this.player.position);
    this.lastTarget = null;
    this.lastThrowTick = game.tick;
    // The shield gift this bot last set off for, and the tile it lay on. See
    // `findShieldDrop`.
    this.soughtDrop = null;
    this.soughtTile = -1;
    this.seekingShield = false;
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
      this.seekingShield = false;

      // Looked for on only some idle frames, so that bots react after a moment
      // rather than all on the same frame. Elves standing together would
      // otherwise pick the same gift at once and walk the same path exactly on
      // top of one another.
      const shieldDrop = Math.random() > 0.95
          ? this.findShieldDrop(game)
          : null;

      if (shieldDrop != null) {
        const index = shieldDrop.arrival.tileIndex;

        this.soughtDrop = shieldDrop;
        this.soughtTile = index;
        this.seekingShield = true;
        playerSystem.assignPlayerDestination(player.playerId, {
          index,
          position: grid.indexToPosition(index)
        });
      } else if (Math.random() > 0.985) {
        //const index = map.getRandomHabitableTileIndex();
        const index = map.getRandomNearbyPassableTileIndex(
            grid.positionToIndex(player.position), 6);

        const position = grid.indexToPosition(index);
        playerSystem.assignPlayerDestination(player.playerId, {
          index,
          position
        });
      }
    } else if (this.seekingShield &&
        !isCollectableShield(this.soughtDrop, this.soughtTile, map)) {
      // Another elf got there first, or the tile has started to sink. Stop at
      // the next waypoint rather than walking on to an empty tile, where every
      // bot that lost the race would end up standing on the same spot.
      this.seekingShield = false;
      path.follow(path.waypoints.slice(0, 1));
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

  /**
   * The nearest shield gift this bot should walk over to, if any. Bots
   * otherwise only wander, so they would collect a shield only by stumbling
   * onto one. Modes opt in with `GameMode.botShieldRange`, in tiles.
   *
   * The gift a bot last set off for is skipped while it still lies on the same
   * tile: being idle with it still there means the bot either found no path
   * to it or arrived without collecting it, and retrying would leave it
   * re-pathing every frame instead of wandering. The tile check is because
   * drops are pooled, so the same object can come back as a fresh gift.
   */
  findShieldDrop(game) {
    const { gameMode, dropSystem, mapSystem } = game;
    const range = gameMode != null ? gameMode.botShieldRange : null;
    const { player, soughtDrop, soughtTile } = this;

    if (range == null || dropSystem.drops == null ||
        player.health.dead || player.shield.active) {
      return null;
    }

    const { map, grid } = mapSystem;
    // Neighbouring hex centres are `cellHeight` apart in every direction.
    const maxDistance = range * grid.cellHeight;
    const maxDistanceSquared = maxDistance * maxDistance;
    let nearest = null;
    let nearestDistanceSquared = Infinity;

    for (let i = 0; i < dropSystem.drops.length; ++i) {
      const drop = dropSystem.drops[i];
      const { tileIndex } = drop.arrival;

      if (!isCollectableShield(drop, tileIndex, map) ||
          (drop === soughtDrop && tileIndex === soughtTile)) {
        continue;
      }

      const dx = drop.position.x - player.position.x;
      const dy = drop.position.y - player.position.y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared <= maxDistanceSquared &&
          distanceSquared < nearestDistanceSquared) {
        nearest = drop;
        nearestDistanceSquared = distanceSquared;
      }
    }

    return nearest;
  }
}
