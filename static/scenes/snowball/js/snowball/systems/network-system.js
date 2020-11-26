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

import { SeedRandom } from '../utils/seed-random.js';
import { Socket } from '../network/socket.js';
import { MessageType, LevelType } from '../constants.js';
import { LobbyLevel } from '../levels/lobby-level.js';
import { NetworkLevel } from '../levels/network-level.js';
import { throwSnowball, move } from '../messages.js';

export class NetworkSystem {
  setup(game) {
    const { clientSystem, clockSystem } = game;
    const { clientId } = clientSystem;

    this.synchronizeTime = (timeZero, time) =>
        clockSystem.synchronize(timeZero, time);
    this.pendingGameInitialization = null;
    this.pendingLevelChange = null;
    this.pendingMessages = [];
    this.clientPlayerId = null;

    this.socket = null; // set when connect is invoked
  }

  teardown(game) {}

  //connect(serverUrl = 'wss://game-dot-next-santa-api.appspot.com/socket') {
  connect(serverUrl = 'ws://localhost:8080/socket') {
    this.socket = new Socket(serverUrl, 'snowball');
    this.socket.target = this;
  }

  post(payload, coalesce) {
    if (this.socket) {
      this.socket.post(payload, coalesce);
    }
  }

  postMove(from, to) {
    this.post(move(from, to));
  }

  postTargetedPosition(targetedPosition) {
    this.post(throwSnowball(targetedPosition));
  }

  update(game) {
    const {
      stateSystem,
      mapSystem,
      dropSystem,
      clientSystem,
      playerSystem
    } = game;

    if (this.pendingGameInitialization) {
      const { seed, erode, players } = this.pendingGameInitialization;

      mapSystem.rebuildMap(game, seed);

      for (let i = 0; i < erode; ++i) {
        mapSystem.map.erode();
      }

      for (let i = 0; i < players.length; ++i) {
        const playerJson = players[i];
        const player = playerSystem.hasPlayer(playerJson.id)
            ? playerSystem.getPlayer(playerJson.id)
            : playerSystem.addPlayerFromJson(playerJson);

        if (player.playerId === this.clientPlayerId &&
            clientSystem.player == null) {
          clientSystem.assignPlayer(player);
        }
      }
    }

    this.pendingGameInitialization = null;

    if (this.pendingLevelChange != null) {
      const { state } = this.pendingLevelChange;
      let LevelClass = null;

      switch (state.level) {
        case LevelType.LOBBY:
          LevelClass = LobbyLevel;
          break;
        case LevelType.MAIN:
          LevelClass = NetworkLevel;
          break;
        default:
          console.warn('Unknown level:', state);
          break;
      }

      if (LevelClass != null && !(game.currentLevel instanceof LevelClass)) {
        game.setLevel(new LevelClass());
      }
    }

    this.pendingLevelChange = null;

    while (this.pendingMessages.length) {
      const message = this.pendingMessages.shift();
      const { type, state, tick } = message;

      switch (type) {
        case MessageType.POPULATION_ANNOUNCED:
          Object.assign(stateSystem.population, state);
          break;
        case MessageType.TILE_ERODED:
          mapSystem.map.erode();
          break;
        case MessageType.PLAYER_JOINED:
          if (!playerSystem.hasPlayer(state.id)) {
            playerSystem.addPlayerFromJson(state);
          }
          break;
        case MessageType.PLAYER_LEFT:
          playerSystem.removePlayer(state.id);
          break;
        case MessageType.PLAYER_MOVED:
          if (player.health.dead) {
            player.health.revive();
          }

          const lastPath = state.path[state.path.length - 1];
          const destination = {
            position: lastPath,
            index: mapSystem.grid.positionToIndex(lastPath),
          };

          playerSystem.assignPlayerDestination(state.id, destination);

          break;
        case MessageType.SNOWBALL_THROWN:
          // TODO
          break;
        default:
          console.warn('Unhandled socket message', message);
          break;
      }
    }
  }

  _indexFor(game, tick, position) {
    const { mapSystem, playerSystem } = game;
    const { map } = mapSystem;

    if (position != null) {
      return mapSystem.grid.positionToIndex(position);
    }

    return map.getRandomHabitableTileIndex(playerSystem.random);
  }

  onSocketMessage(message) {
    console.log('Handling message', message);

    switch (message.type) {
      case MessageType.TIME_SYNCHRONIZED:
        const { timeZero, time } = message;
        this.synchronizeTime(timeZero, time);
        break;
      case MessageType.GAME_INITIALIZED:
        this.pendingGameInitialization = message;
        break;
      case MessageType.LEVEL_CHANGED:
        this.pendingLevelChange = message;
        break;
      case MessageType.PLAYER_ASSIGNED:
        this.clientPlayerId = message.state.id;
        break;
      default:
        this.pendingMessages.push(message);
        break;
    }
  }
};
