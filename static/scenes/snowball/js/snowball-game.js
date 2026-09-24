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

import { Game } from './engine/core/game.js';
import { Collision2DSystem } from './engine/systems/collision-2d-system.js';
import { SnowballSystem } from './snowball/systems/snowball-system.js';
import { EffectSystem } from './snowball/systems/effect-system.js';
import { LodSystem } from './snowball/systems/lod-system.js';
import { MapSystem } from './snowball/systems/map-system.js';
import { PlayerSystem } from './snowball/systems/player-system.js';
import { ClientSystem } from './snowball/systems/client-system.js';
import { NetworkSystem } from './snowball/systems/network-system.js';
import { ParachuteSystem } from './snowball/systems/parachute-system.js';
import { StateSystem } from './snowball/systems/state-system.js';
import { EntityRemovalSystem } from './snowball/systems/entity-removal-system.js';
import { DropSystem } from './snowball/systems/drop-system.js';
import { BotSystem } from './snowball/systems/bot-system.js';
import { LocalLevel } from './snowball/levels/local-level.js';
import { LobbyLevel } from './snowball/levels/lobby-level.js';

const { Scene, PerspectiveCamera } = self.THREE;

const GameType = {
  LOCAL: 'local',
  MULTIPLAYER: 'multiplayer'
};

/**
 * Quick is a quarter of Arena's field with a quarter of the players, so the
 * steady-state density (~41 tiles per elf) matches. It differs in how quickly
 * it gets there: `initialPlayers` puts about half the field's elves down at
 * the drop rather than trickling them all in, so the fighting starts early
 * without the opening feeling packed.
 *
 * The tile scale is the same in both modes, so the hexes are the same physical
 * size on screen; there are simply fewer of them.
 */
export const GameMode = {
  QUICK: {
    name: 'quick',
    maximumPlayers: 25,
    initialPlayers: 12,
    // Thinner cover than Arena: on a quarter-sized field the same proportion
    // of trees leaves noticeably less room to manoeuvre.
    treeDensity: 0.10,
    unitWidth: 32,
    unitHeight: 32,
    // Quick deliberately keeps the original behaviour: every gift is a big
    // snowball. A short match has little room for defensive play.
    shieldChance: 0
  },
  ARENA: {
    name: 'arena',
    maximumPlayers: 100,
    initialPlayers: 25,
    treeDensity: 0.15,
    unitWidth: 64,
    unitHeight: 64,
    // One drop in three is a shield — a first aid kit — instead of a big
    // snowball.
    shieldChance: 1 / 3
  }
};

const TILE_SCALE = 64.0;

export class SnowballGame extends Game {
  static get is() { return 'snowball-game'; }

  get maximumPlayers() { return this._gameMode.maximumPlayers; };

  /** How many elves are on the field at the drop; the rest trickle in. */
  get initialPlayers() { return this._gameMode.initialPlayers; };

  get gameMode() { return this._gameMode; }

  /**
   * Selects a game mode, either by mode object or by name. The grid dimensions
   * get baked into shader uniforms and the mouse-picking plane the first time
   * the map is set up, so this must be assigned before the game's first frame.
   */
  set gameMode(mode) {
    const nextMode = typeof mode === 'string'
        ? Object.keys(GameMode).map(key => GameMode[key])
            .find(candidate => candidate.name === mode)
        : mode;

    if (nextMode == null) {
      console.warn(`Unknown snowball game mode: ${mode}`);
      return;
    }

    this._gameMode = nextMode;
    this.mapSystem.resize(nextMode.unitWidth, nextMode.unitHeight, TILE_SCALE);
  }

  constructor() {
    super();

    this._gameMode = GameMode.ARENA;

    this.assetBaseUrl = '';
    this.collisionSystem = new Collision2DSystem(object => object.collider || object);
    this.lodSystem = new LodSystem();
    this.effectSystem = new EffectSystem();
    this.snowballSystem = new SnowballSystem();
    this.parachuteSystem = new ParachuteSystem();
    this.entityRemovalSystem = new EntityRemovalSystem();
    this.dropSystem = new DropSystem();
    this.mapSystem = new MapSystem(
        GameMode.ARENA.unitWidth, GameMode.ARENA.unitHeight, TILE_SCALE);
    this.botSystem = new BotSystem();
    this.clientSystem = new ClientSystem();
    this.networkSystem = new NetworkSystem();
    this.playerSystem = new PlayerSystem();
    this.stateSystem = new StateSystem();

    this.renderSystem.renderer.setClearColor(0x71A7DB, 1.0);
  }

  setup() {
    this.setupTick = this.tick;

    super.setup();

    this.mapSystem.setup(this);
    this.playerSystem.setup(this);
    this.clientSystem.setup(this);
    this.networkSystem.setup(this);
    this.dropSystem.setup(this);
    this.stateSystem.setup(this);
  }

  update() {
    super.update();

    this.collisionSystem.update(this);
    this.lodSystem.update(this);
    this.snowballSystem.update(this);
    this.entityRemovalSystem.update(this);
    this.dropSystem.update(this);
    this.parachuteSystem.update(this);
    this.effectSystem.update(this);
    this.mapSystem.update(this);
    this.clientSystem.update(this);
    this.networkSystem.update(this);
    this.botSystem.update(this);
    this.playerSystem.update(this);
  }

  teardown() {
    super.teardown();

    this.collisionSystem.teardown(this);
    this.lodSystem.teardown(this);
    this.snowballSystem.teardown(this);
    this.entityRemovalSystem.teardown(this);
    this.dropSystem.teardown(this);
    this.parachuteSystem.teardown(this);
    this.effectSystem.teardown(this);
    this.mapSystem.teardown(this);
    this.clientSystem.teardown(this);
    this.networkSystem.teardown(this);
    this.botSystem.teardown(this);
    this.playerSystem.teardown(this);
    this.stateSystem.teardown(this);
  }

  start(gameType = GameType.MULTIPLAYER) {
    switch (gameType) {
      case GameType.MULTIPLAYER:
        this.networkSystem.connect();
        this.setLevel(new LobbyLevel());
        break;
      case GameType.LOCAL:
        this.setLevel(new LocalLevel());
        break;
    }
  }
};

customElements.define(SnowballGame.is, SnowballGame);
