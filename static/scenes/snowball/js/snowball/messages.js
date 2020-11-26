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

import { MessageType } from './constants.js';

export const throwSnowball = target => ({
  type: MessageType.SNOWBALL_THROWN,
  target
});

export const move = (from, to) => ({
  type: MessageType.PLAYER_MOVED,
  from, to
});

export const changeLevel = level => ({
  type: MessageType.LEVEL_CHANGED,
  state: { level }
});

export const announcePopulation = (allTime, present, maximum, knockedOut) => ({
  type: MessageType.POPULATION_ANNOUNCED,
  state: {
    allTime,
    present,
    maximum,
    knockedOut
  }
});

export const initializeGame = (seed, players) => ({
  type: MessageType.GAME_INITIALIZED,
  seed,
  players
});

export const assignPlayer = player => ({
  type: MessageType.PLAYER_ASSIGNED,
  state: { id: player.id }
});

export const enterPlayer = player => ({
  type: MessageType.PLAYER_JOINED,
  state: player
});

export const exitPlayer = player => ({
  type: MessageType.PLAYER_LEFT,
  state: { id: player.id }
});

export const synchronizeTime = (timeZero, time) => ({
  type: MessageType.TIME_SYNCHRONIZED,
  timeZero,
  time
});

export const erodeTile = () => ({
  type: MessageType.TILE_ERODED
});
