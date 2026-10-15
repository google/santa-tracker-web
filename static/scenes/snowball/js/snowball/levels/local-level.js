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
import { sceneString } from '../utils/scene-strings.js';

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

    // Reset per round, so that a restart can announce a win of its own.
    this.announcedWin = false;

    const seed = (Math.random() * 0x100000000) & 0xffffffff;  // 32bit int
    mapSystem.rebuildMap(game, seed);

    const id = 'local';
    const player = playerSystem.addPlayer(id, -1);
    clientSystem.assignPlayer(player);

    // Drops stay proportional to the map, but the starting elf count is a
    // per-mode choice: Quick front-loads most of its population so the action
    // starts at once. Falls back to the original fraction if a game object
    // doesn't define one.
    const initialDrops = Math.floor(game.maximumPlayers / 4);
    const initialBots = game.initialPlayers != null
        ? game.initialPlayers
        : initialDrops;

    for (let i = 0; i < initialDrops; ++i) {
      dropSystem.addDrop();
    }

    for (let i = 0; i < initialBots; ++i) {
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
      clientSystem,
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

    // Guarded two ways.
    //
    // `announcedWin` is because the population condition stays true for every
    // frame after the last rival falls, and without it the scene would announce
    // the win, and log the analytics event, sixty times a second.
    //
    // The liveness check is because `knockedOut` counts every elf that has
    // died, the player included — `Elf.die` records them all. In the closing
    // one-on-one the player's own death is the knockout that brings the count
    // up to `maximum - 1`, so on corpses alone this reads as a win at the exact
    // moment the player loses. The surviving elf has to actually be the player.
    const clientPlayer = clientSystem.player;
    const playerSurvives = clientPlayer != null && !clientPlayer.health.dead;

    if (!this.announcedWin && playerSurvives &&
        population.knockedOut >= (population.maximum - 1)) {
      this.announcedWin = true;

      window.santaApp.fire('game-stop', {
        level: population.knockedOut,
        maxLevel: population.maximum - 1,
        levelLabel: 'iced',
        gameoverMessage: sceneString('snowball_gameover_win'),
      });
      gtag('event', 'gameAction', {game: 'snowball', action: 'win'});

      // Freeze the world behind the overlay. The map is still eroding, so a
      // winner left standing on it would eventually drown and trigger the
      // client's lose screen on top of this one.
      game.finish();
    }
  }
}
