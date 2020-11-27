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

import { MainLevel } from './main-level.js';

export class LocalLevel extends MainLevel {
  setup(game) {
    super.setup(game);

    const {
      clientSystem,
      dropSystem,
      mapSystem,
      playerSystem,
      botSystem
    } = game;

    this.lastErosionTick = 0;
    this.lastDropTick = 0;
    this.lastBotTick = 0;
    this.startTime = +new Date;

    const seed = (Math.random() * 0x100000000) & 0xffffffff;  // 32bit int
    mapSystem.rebuildMap(game, seed);

    const id = 'local';
    const player = playerSystem.addPlayer(id, -1);
    clientSystem.assignPlayer(player);

    for (let i = 0; i < Math.floor(game.maximumPlayers / 4); ++i) {
      dropSystem.addDrop();
      botSystem.addBot();
    }
  }

  update(game) {
    super.update(game);

    const {
      mapSystem,
      dropSystem,
      botSystem,
      stateSystem,
      tick
    } = game;

    const { map } = mapSystem;
    const { population } = stateSystem;

    // 300000 ms / 30 drops / 16 ms/f = 625 f/drop
    if (map && (tick - this.lastDropTick) > 625) {
      this.lastDropTick = tick;
      dropSystem.addDrop();
    }

    if (map && (tick - this.lastErosionTick) > 16) {
      this.lastErosionTick = tick;
      map.erode();
    }

    if (population.allTime < population.maximum) {
      if (map && (tick - this.lastBotTick) > 128) {
        botSystem.addBot();
        this.lastBotTick = tick;
      }
    }

    if (population.knockedOut >= (population.maximum - 1)) {
      // TODO(cdata): Is there a special victory screen?
      window.santaApp.fire('game-stop', {
        score: population.knockedOut,
      });
      window.ga('send', 'event', 'game', 'win', 'snowball');
    }
  }
}
