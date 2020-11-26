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

const {
  Math: ThreeMath,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial
} = self.THREE;

const endGameAfter = 2500;
const localClientId = 'local';

export class ClientSystem {
  constructor() {
    this.player = null;
    this.targetedPosition = null;
    this.destination = null;
    this.pendingSpawnAt = null;

    const arrivalMarker = new PlayerMarker();
    arrivalMarker.material.depthTest = false;

    this.arrivalMarker = arrivalMarker;
    this.announcedDeath = false;
    this.lastValidScore = 0;
    this.wasDeadAt = 0;
  }

  assignTarget(target) {
    this.targetedPosition = target.position.clone();
  }

  assignDestination(destination) {
    this.destination = destination;
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

    this.player = null;
  }

  setup(game) {}

  update(game) {
    if (this.player == null) {
      return;
    }

    const { clockSystem, stateSystem } = game;
    const { population } = stateSystem;
    const { knockedOut, maximum } = population;

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
          maxLevel: -1,
        });
        this.announcedDeath = true;
      }
      return;
    }

    window.santaApp.fire('game-score', {
      level: knockedOut,
      maxLevel: -1,
      time: (clockSystem.time / 1000),
    });
    this.lastValidScore = knockedOut;

    const { networkSystem, playerSystem, mapSystem } = game;
    const { grid } = mapSystem;
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
    } else {
      if (arrivalMarker.parent != null) {
        arrivalMarker.parent.remove(arrivalMarker);
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
};
