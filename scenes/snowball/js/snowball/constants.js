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

export const LevelType = {
  LOBBY: 0,
  MAIN: 1
};

export const MessageType = {
  // There is a new current game level
  LEVEL_CHANGED: 0,
  // An update on the number of players that are in the game
  POPULATION_ANNOUNCED: 1,
  // The player is connecting but already has a client ID that they had from
  // a previous unintended disconnection.
  RECONNECTED: 2,
  // The game just started, or the client has just connected to an ongoing game.
  // At this time, the map will be generated anew from a provided seed.
  GAME_INITIALIZED: 3,
  // A tile in the map has eroded away
  TILE_ERODED: 4,
  // A player has joined the game
  PLAYER_JOINED: 5,
  // A player has disconnected from the game
  PLAYER_LEFT: 6,
  // A player has moved
  PLAYER_MOVED: 7,
  // A snowball has been thrown
  SNOWBALL_THROWN: 8,
  // A client has been assigned a player ID
  PLAYER_ASSIGNED: 9,
  // A time offset has been sent from the server to synchronize the
  // client
  TIME_SYNCHRONIZED: 10
};

/*
{
  type: 'gameInitialized',
  erode: 0,
  seed: 0,
  players: {
    $playerId: {
      joinTick: 0,
      at: {
        x: 0,
        y: 0
      }
    }
  }
}
*/
