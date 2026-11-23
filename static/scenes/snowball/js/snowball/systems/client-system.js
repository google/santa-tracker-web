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

import { PlayerMarker } from '../entities/player-marker.js';
import { KeyboardControls } from '../utils/keyboard-controls.js';
import { sceneString } from '../utils/scene-strings.js';

const {
  Math: ThreeMath,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Vector2
} = self.THREE;

const endGameAfter = 2500;
const localClientId = 'local';

// How many tiles ahead a held arrow key aims. Kept short so a tap travels a
// short distance and a change of direction takes effect promptly; continuous
// movement is preserved by re-pathing before the last waypoint is consumed.
const keyboardLookAheadTiles = 2;

// How closely a hex neighbour has to match the held key before the elf will
// step onto it, as a cosine. Flat-top neighbours sit at 0, ±0.5, ±0.866 and ±1
// relative to the cardinal keys, so this admits everything in the forward
// hemisphere and rejects the two purely sideways tiles. Walking sideways on a
// "right" press would let the elf slither up and down a wall it is pressed
// against instead of simply stopping.
const keyboardForwardThreshold = 0.1;

// How hard the elf is steered back onto the straight line it is supposed to be
// walking, per cell-height of drift. No hex neighbour lies due east, so a held
// "right" can only be served by alternating up-right and down-right steps; this
// is what makes them alternate rather than settling on whichever one happened
// to win first and leaving at a 30° angle. It is deliberately large enough to
// also pull the elf back in line after it has slid around an obstacle.
const keyboardDriftPenalty = 0.35;

// Stops a long detour around a big cluster of trees from building up so much
// drift that correcting it outweighs going the way the player asked.
const keyboardMaximumDriftCells = 3.0;

// Matches the snowball's own `maxDistance`, so a keyboard throw travels as far
// as the game allows rather than landing short.
const keyboardThrowDistance = 256;

// The landing marker starts small and reaches full size as the player touches
// down. Matches `LandingShadow`'s `minimumScale`, so the client player's marker
// and every other elf's shadow grow at the same rate.
const markerMinimumScale = 0.4;

export class ClientSystem {
  constructor() {
    this.player = null;
    this.targetedPosition = null;
    this.destination = null;
    this.destinationFromPointer = true;
    this.pendingSpawnAt = null;

    this.keyboard = null;
    // Remembered so a change of direction re-paths immediately, rather than
    // waiting for the current walk to finish.
    this.keyboardDirectionX = 0;
    this.keyboardDirectionY = 0;

    // Where the current directional run began. Candidate tiles are scored on
    // how far they sit off the line running from here in the held direction,
    // which is what keeps a held key walking straight across a grid whose
    // neighbours don't line up with it. Re-anchored on every turn.
    this.keyboardRayOrigin = new Vector2(0, 0);

    // Where the next keyboard throw goes. This tracks the direction the elf is
    // actually walking, not the arrow key that was pressed: the two differ on a
    // hex grid, where "right" resolves to an up-right or down-right neighbour.
    // Down-screen until the first step, which is as good a guess as any.
    this.keyboardAim = new Vector2(0, -1);

    const arrivalMarker = new PlayerMarker();
    arrivalMarker.material.depthTest = false;

    // `Arrival.droppedTick` starts at Infinity, so there is a window before the
    // drop begins where the growth code below doesn't run. Start small so the
    // marker never flashes at full size.
    arrivalMarker.scale.set(markerMinimumScale, markerMinimumScale, 1.0);

    this.arrivalMarker = arrivalMarker;
    this.announcedDeath = false;
    this.lastValidScore = 0;
    this.wasDeadAt = 0;
  }

  assignTarget(target) {
    this.targetedPosition = target.position.clone();
  }

  /**
   * `fromPointer` defaults to true because a click was the only way to order a
   * move before the keyboard existed, and `main-level.js` — the pick handler —
   * is still the caller that doesn't pass it.
   *
   * It describes the walk rather than this one assignment, so unlike
   * `destination` it is deliberately not cleared once consumed.
   */
  assignDestination(destination, fromPointer = true) {
    this.destination = destination;
    this.destinationFromPointer = fromPointer;
  }

  assignPlayer(player) {
    this.player = player;
  }

  teardown(game) {
    const { playerSystem } = game;

    if (this.player != null) {
      playerSystem.removePlayer(this.player.playerId, game);
    }

    const { arrivalMarker } = this;
    if (arrivalMarker.parent != null) {
      arrivalMarker.parent.remove(arrivalMarker);
    }

    if (this.keyboard != null) {
      this.keyboard.dispose();
      this.keyboard = null;
    }

    this.player = null;
  }

  setup(game) {
    this.keyboard = new KeyboardControls();
  }

  update(game) {
    if (this.player == null) {
      return;
    }

    const { clockSystem, stateSystem } = game;
    const { population } = stateSystem;
    const { knockedOut, maximum } = population;

    // `maximum` counts every elf in the match, the player included. The player
    // cannot ice themselves, so the badge counts against everyone else: hitting
    // this number is exactly the win condition, rather than a total that is
    // unreachable by one.
    const iceableElves = maximum - 1;

    const { camera } = game;
    const { presence, playerId, health, path, arrival } = this.player;

    if (health.dead) {
      const now = performance.now();
      if (!this.wasDeadAt) {
        // even if the player isn't gone, announce the game over status quickly
        this.wasDeadAt = now;
      }

      if ((presence.gone || now - this.wasDeadAt > endGameAfter) && !this.announcedDeath) {
        console.info('now was', now, 'wasDeadAt', this.wasDeadAt);
        window.santaApp.fire('game-stop', {
          level: this.lastValidScore,
          maxLevel: iceableElves,
          levelLabel: 'iced',
          // Reaching here means the player was knocked out. Winning is
          // announced separately, by the level.
          gameoverMessage: sceneString('snowball_gameover_lose'),
          // Swaps the shared trophy elf for one buried in snowballs. The win
          // path leaves this unset and keeps the trophy.
          gameoverArt: 'lose',
        });
        this.announcedDeath = true;

        // Freeze the world behind the overlay. Left running, the surviving
        // bots go on fighting and drowning, and the level's win condition
        // eventually trips and replaces this lose screen with a victory one.
        game.finish();
      }
      return;
    }

    window.santaApp.fire('game-score', {
      level: knockedOut,
      maxLevel: iceableElves,
      levelLabel: 'iced',
      time: (clockSystem.time / 1000),
    });
    this.lastValidScore = knockedOut;

    const { networkSystem, playerSystem, mapSystem, parachuteSystem } = game;
    const { grid } = mapSystem;

    // Runs before the destructure below so that a key pressed this frame is
    // picked up now rather than one frame later.
    this.updateKeyboardControls(game);

    const { destination, targetedPosition, arrivalMarker } = this;

    if (!arrival.arrived) {
      if (arrivalMarker.parent == null && arrival.tileIndex > -1) {
        const position = grid.indexToPosition(arrival.tileIndex);

        arrivalMarker.position.z = 19.0;
        arrivalMarker.position.y = position.y + this.player.dolly.position.y;
        arrivalMarker.position.x = position.x;
        arrivalMarker.rotation.x = this.player.dolly.rotation.x;

        camera.position.x = position.x;
        camera.position.y = position.y * -0.75;

        playerSystem.playerLayer.add(arrivalMarker);
      }

      // Grows as the player falls, reaching full size as their feet touch the
      // tile. Every other elf gets a `LandingShadow` doing exactly this; the
      // client player is passed over for one, in `player-system`, precisely
      // because this marker is already there, so the marker has to carry the
      // same sense of approach itself.
      if (arrivalMarker.parent != null && arrival.isDropping()) {
        const descent = (game.tick - arrival.droppedTick) / parachuteSystem.frameCount;
        const progress = descent < 0.0 ? 0.0 : descent > 1.0 ? 1.0 : descent;
        const scale =
            markerMinimumScale + (1.0 - markerMinimumScale) * progress;

        // Z is left alone: the ring is flat, so scaling along its normal does
        // nothing.
        arrivalMarker.scale.set(scale, scale, 1.0);
      }
    } else {
      if (arrivalMarker.parent != null) {
        arrivalMarker.parent.remove(arrivalMarker);

        // Put back to its starting size, since the marker outlives the drop and
        // is reused on the next one.
        arrivalMarker.scale.set(
            markerMinimumScale, markerMinimumScale, 1.0);
      }
    }

    if (destination != null) {
      playerSystem.assignPlayerDestination(playerId, destination);
      networkSystem.postMove(this.player.position, destination.position);

      this.destination = null;
    }

    if (targetedPosition != null) {
      playerSystem.assignPlayerTargetedPosition(
          playerId, this.targetedPosition);
      networkSystem.postTargetedPosition(this.targetedPosition);

      this.targetedPosition = null;
    }
  }

  /**
   * Translates held keys into the same destination and target assignments that
   * a mouse click produces, so pathfinding, animation and networking all take
   * the identical route.
   */
  updateKeyboardControls(game) {
    const { keyboard, player } = this;

    if (keyboard == null || player == null) {
      return;
    }

    const { map, grid } = game.mapSystem;

    // Before touching down the player has no position on the grid yet.
    if (map == null || !player.arrival.arrived) {
      return;
    }

    // Movement first. Turning and throwing in quick succession delivers both
    // key events within a single frame, so resolving the throw first would aim
    // it along the direction the player just turned away from.
    this.updateKeyboardMovement(grid, map, player, keyboard);

    if (keyboard.consumeThrowRequest()) {
      const aim = this.keyboardAim;

      this.assignTarget({
        position: new Vector2(
            player.position.x + aim.x * keyboardThrowDistance,
            player.position.y + aim.y * keyboardThrowDistance)
      });
    }
  }

  /**
   * Walks the player according to the held arrow keys, and keeps `keyboardAim`
   * pointing wherever the elf is actually headed.
   */
  updateKeyboardMovement(grid, map, player, keyboard) {
    const direction = keyboard.currentDirection();

    if (direction == null) {
      // Only act on the frame the last key comes up. Running this while idle
      // would also truncate paths created by clicking, breaking mouse control.
      if (this.keyboardDirectionX !== 0 || this.keyboardDirectionY !== 0) {
        this.keyboardDirectionX = 0;
        this.keyboardDirectionY = 0;
        this.stopAfterNextWaypoint(player);
      }
      return;
    }

    const turned = direction.x !== this.keyboardDirectionX ||
        direction.y !== this.keyboardDirectionY;

    // Re-path on a turn, or as the current hop runs out. Refreshing one
    // waypoint early keeps a held key moving smoothly; refreshing every frame
    // would restart the walk animation continuously.
    if (!turned && player.path.waypoints.length > 1) {
      return;
    }

    if (turned) {
      this.keyboardRayOrigin.set(player.position.x, player.position.y);
    }

    this.keyboardDirectionX = direction.x;
    this.keyboardDirectionY = direction.y;

    const destination = this.keyboardDestination(grid, map, player, direction);

    if (destination == null) {
      // Blocked, so the elf stays put and keeps facing the way it was asked to
      // go. The key vector is the best available guess at that facing.
      this.keyboardAim.set(direction.x, direction.y).normalize();
      return;
    }

    // Aim down the tile the elf is walking to rather than down the key vector.
    // Hex neighbours do not line up with the cardinal axes — pressing right
    // sends the elf diagonally — and a snowball flying somewhere the elf
    // visibly is not heading is the bug this avoids.
    this.keyboardAim
        .set(destination.position.x - player.position.x,
             destination.position.y - player.position.y)
        .normalize();

    // Not from the pointer, so the destination cross stays hidden. It would sit
    // a fixed two tiles ahead and jitter as the look-ahead re-paths, which tells
    // the player nothing the chevron isn't already saying more calmly.
    this.assignDestination(destination, false);
  }

  /**
   * Trims a keyboard-driven path down to its next step, so releasing a key
   * stops the elf at the adjacent tile rather than letting it coast to the end
   * of its look-ahead. Re-following keeps `destination` consistent with the
   * remaining waypoints, which the destination marker reads.
   */
  stopAfterNextWaypoint(player) {
    const { path } = player;

    if (path.waypoints.length > 1) {
      path.follow(path.waypoints.slice(0, 1));
    }
  }

  /**
   * Picks the tile a held arrow key should walk the elf to.
   *
   * This steps through real hex neighbours rather than sampling points along
   * the key vector, which is what makes obstacles behave. The old version probed
   * the positions one and two tiles along the vector and gave up if they were
   * blocked, which produced both of the failures this replaces:
   *
   *   - A tree directly ahead stopped the elf dead, where the same obstacle
   *     under mouse control is simply walked around.
   *   - A tree one tile ahead with clear ground behind it returned the *far*
   *     tile, and `PlayerSystem`'s pathfinder then routed the elf around the
   *     tree by whichever side it preferred. Since the look-ahead re-paths
   *     continuously, that choice could flip from frame to frame, which is the
   *     wide, apparently random swerve that gets reported.
   *
   * Now each step is a neighbour of the last, chosen from those pointing the way
   * the player asked. If the best one is blocked the next best is taken, which
   * walks the elf along the obstacle and out the far side — the sliding that
   * direct control is expected to have, and cheaper and far more predictable
   * than asking the pathfinder to solve a two-tile hop.
   *
   * Returning null still matters: an unreachable destination makes
   * `PlayerSystem` throw a snowball at it instead of walking, so a genuinely
   * boxed-in elf has to report that rather than guess.
   */
  keyboardDestination(grid, map, player, direction) {
    let index = grid.positionToIndex(player.position);
    let position = player.position;
    let destination = null;

    for (let tiles = 0; tiles < keyboardLookAheadTiles; ++tiles) {
      const step = this.bestNeighborTowards(grid, map, index, position, direction);

      if (step == null) {
        break;
      }

      index = step.index;
      position = step.position;
      destination = step;
    }

    return destination;
  }

  /**
   * Of the six tiles around `fromIndex`, the best one to step onto to keep
   * heading in `direction`.
   *
   * Candidates must be traversable and lie in the forward hemisphere; among
   * those, the score trades off how squarely the step matches the key against
   * how far it would leave the elf from the line it is supposed to be walking.
   * That second term does double duty: it alternates the two equally-good
   * diagonals on a cardinal press, and it steers the elf back on course after a
   * detour around a tree.
   *
   * Returns null when the elf is boxed in.
   */
  bestNeighborTowards(grid, map, fromIndex, fromPosition, direction) {
    // Materialised in one go: the grid reuses scratch objects internally, so
    // the indices have to be read out before any other grid call runs.
    const neighbors = grid.indexToNeighborIndices(fromIndex);
    const origin = this.keyboardRayOrigin;

    let best = null;
    let bestScore = -Infinity;

    for (let i = 0; i < neighbors.length; ++i) {
      const index = neighbors[i];

      // `isTraversable` rejects out-of-range indices, which is how the -1 that
      // the grid returns for a neighbour off the edge of the map is handled.
      if (index === fromIndex || !map.isTraversable(index)) {
        continue;
      }

      const position = grid.indexToPosition(index);
      const deltaX = position.x - fromPosition.x;
      const deltaY = position.y - fromPosition.y;
      const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (length === 0) {
        continue;
      }

      const towards = (deltaX * direction.x + deltaY * direction.y) / length;

      if (towards <= keyboardForwardThreshold) {
        continue;
      }

      // Signed distance from the line through `origin` along `direction`. The
      // keys are unit cardinals, so this is just the 2D cross product.
      const drift = direction.x * (position.y - origin.y) -
          direction.y * (position.x - origin.x);

      const driftCells = Math.min(
          Math.abs(drift) / grid.cellHeight, keyboardMaximumDriftCells);

      const score = towards - keyboardDriftPenalty * driftCells;

      if (score > bestScore) {
        bestScore = score;
        best = {index, position};
      }
    }

    return best;
  }
};
