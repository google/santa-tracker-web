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


export class StateSystem {
  get hasCurrentPopulation() {
    return this.population &&
        this.population.present > -1 &&
        this.population.maximum > -1;
  }

  recordPlayerConnected() {
    this.population.allTime++;
    this.population.present++;
  }

  recordPlayerDisconnected() {
    if (this.population.present > 0) {
      this.population.present--;
    }
  }

  recordPlayerKnockedOut() {
    this.population.knockedOut++;
  }

  finishMatch(tick, winner = null) {
    this.matchFinished = true;
    this.matchFinishTick = tick;
    this.winner = winner;
  }

  setup(game) {
    this.winner = null;
    this.matchFinished = false;
    this.matchFinishTick = -1;
    this.population = {
      // Total number of clients that ever connected to the game:
      allTime: 0,
      // Total number of living players:
      present: -1,
      // Maximum players allowed in an instance:
      maximum: game.maximumPlayers != null ? game.maximumPlayers : 1,
      // Total number of non-living players:
      knockedOut: 0
    };
  }

  update(game) {
    const { playerSystem, tick } = game;
    const { players } = playerSystem;

    let lastLivingPlayer = null;
    let livingPlayerCount = 0;

    for (let i = 0; i < players.length; ++i) {
      const player = players[i];
      const { health } = player;

      if (health.dead) {
        continue;
      }

      lastLivingPlayer = player;
      livingPlayerCount++;
    }

    if (livingPlayerCount < 2) {
      this.finishMatch(tick, lastLivingPlayer);
    }
  }

  teardown(game) {}
};
