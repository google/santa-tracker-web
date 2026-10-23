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

import { Drop } from '../entities/drop.js';
import { powerupType } from '../components/powerup.js';

const {
  Object3D,
  Vector2
} = self.THREE;

const intermediateVector2 = new Vector2();

export class DropSystem {
  setup(game) {
    this.newDrops = [];
    this.parachutingDrops = [];
    this.drops = [];
    this.dropLayer = new Object3D();
    // The mode is fixed for the duration of a match, and `addDrop` has no
    // reference to `game`, so the odds are cached here, along with the
    // thresholds that `shieldsShouldUnlock` checks.
    const {gameMode} = game;
    this.shieldChance = (gameMode && gameMode.shieldChance) || 0;
    this.shieldUnlock = (gameMode && gameMode.shieldUnlock) || {};
    // Latched in `update`, and reset here so a restart opens with snowballs.
    this.shieldsUnlocked = false;
  }

  teardown(game) {
    const drops = this.drops
        .concat(this.newDrops)
        .concat(this.parachutingDrops);
    for (let i = 0; i < drops.length; ++i) {
      const drop = drops[i];
      this.dropLayer.remove(drop);
      drop.teardown(game);
      Drop.free(drop);
    }

    this.drops = [];
    this.newDrops = [];
    this.parachutingDrops = [];
  }

  addDrop(tileIndex = -1, containedItem = this.rollContents()) {
    // Passed to `allocate` as well as pushed below: the drop paints itself to
    // match its contents, so a shield arrives as a first aid kit rather than
    // another wrapped present.
    const drop = Drop.allocate(containedItem);

    drop.arrival.tileIndex = tileIndex;
    drop.contents.inventory.push(containedItem);

    this.drops.push(drop);
    this.newDrops.push(drop);
  }

  /**
   * Once unlocked, shields are sprinkled among the gifts; until then every gift
   * is a big snowball. `randomValue(powerupType)` is not used here because it
   * would also roll `NOTHING`, and the odds need to be tuned per mode anyway.
   */
  rollContents() {
    if (!this.shieldsUnlocked) {
      return powerupType.BIG_SNOWBALL;
    }

    return Math.random() < this.shieldChance
        ? powerupType.SHIELD
        : powerupType.BIG_SNOWBALL;
  }

  /**
   * Whether shields have earned their place in the drop rotation yet.
   *
   * Shields are held back from the opening of a match. Early on the field is
   * crowded and the island is wide, so immunity mostly buys a player a free
   * walk across open ground; the powerup only becomes interesting once the
   * match has tightened up. Meeting any one condition is enough, because a
   * match can tighten in three unrelated ways -- slowly, through attrition, or
   * through the map closing in -- and waiting for all three would hold shields
   * back until a game was nearly over.
   *
   * The thresholds are per mode (`GameMode.shieldUnlock` in snowball-game.js),
   * and a mode can leave a condition out by omitting it.
   *
   * All three are monotonic -- time only advances, elves only fall, tiles only
   * sink -- so this is never asked again once it has answered.
   */
  shieldsShouldUnlock(game) {
    if (this.shieldChance <= 0) {
      return false;
    }

    const {ticks, remainingElves, tileFraction} = this.shieldUnlock;
    const {mapSystem, stateSystem, tick, setupTick} = game;

    // The match has run long enough.
    if (ticks != null && tick - setupTick >= ticks) {
      return true;
    }

    const {population} = stateSystem;

    // The field has thinned out. Counts elves yet to be knocked out, including
    // any still to spawn, which is the same figure the HUD shows as remaining.
    if (remainingElves != null && population != null &&
        (population.maximum - population.knockedOut) < remainingElves) {
      return true;
    }

    const {map} = mapSystem;

    // The island has eroded.
    if (tileFraction != null && map != null &&
        map.initialPassableTileCount > 0 &&
        map.passableTileCount <= map.initialPassableTileCount * tileFraction) {
      return true;
    }

    return false;
  }

  update(game) {
    const {
      playerSystem,
      collisionSystem,
      entityRemovalSystem,
      mapSystem,
      parachuteSystem
    } = game;
    const { map, grid } = mapSystem;

    if (!this.shieldsUnlocked && this.shieldsShouldUnlock(game)) {
      this.shieldsUnlocked = true;
    }

    if (map == null) {
      return;
    }

    while (this.newDrops.length) {
      const drop = this.newDrops.shift();

      drop.setup(game);

      const { arrival } = drop;

      this.parachutingDrops.push(drop);

      if (arrival.tileIndex < 0) {
        arrival.tileIndex = map.getRandomHabitableTileIndex();
      }

      parachuteSystem.dropEntity(drop);
    }

    for (let i = 0; i < this.parachutingDrops.length; ++i) {
      const drop = this.parachutingDrops[i];
      const { arrival } = drop;

      if (arrival.arrived) {
        this.parachutingDrops.splice(i--, 1);

        const position = grid.indexToPosition(
            arrival.tileIndex, intermediateVector2);

        drop.position.x = position.x;
        drop.position.y = position.y;

        collisionSystem.addCollidable(drop);
        this.dropLayer.add(drop);
      }
    }

    for (let i = 0; i < this.drops.length; ++i) {
      const drop = this.drops[i];
      const { arrival, presence } = drop;

      if (arrival.arrived) {
        drop.update(game);
      }

      const tileIndex = grid.positionToIndex(drop.position);
      const tileState = map.getTileState(tileIndex);

      if (arrival.arrived) {
        if (!presence.gone) {
          if (!presence.exiting) {
            if (tileState === 4.0) {
              collisionSystem.removeCollidable(drop);
              entityRemovalSystem.freezeEntity(drop);
            } else if (drop.collidingPlayer != null) {
              playerSystem.assignPlayerPowerup(
                  drop.collidingPlayer.playerId, drop.contents.inventory[0]);
              drop.collidingPlayer = null;
              drop.spin();
            }
          } else {
            collisionSystem.removeCollidable(drop);
          }
        } else {
          if (drop.parent === this.dropLayer) {
            this.dropLayer.remove(drop);
          }

          this.drops.splice(i--, 1);
          drop.teardown(game);
          Drop.free(drop);
        }
      }
    }
  }
};
