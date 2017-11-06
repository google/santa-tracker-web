import { Game } from './engine/core/game.js';
import { Collision2DSystem } from './engine/systems/collision-2d-system.js';
import { SnowballSystem } from './snowball/systems/snowball-system.js';
import { EffectSystem } from './snowball/systems/effect-system.js';
import { MapSystem } from './snowball/systems/map-system.js';
import { PlayerSystem } from './snowball/systems/player-system.js';
import { DummyTargetSystem } from './snowball/systems/dummy-target-system.js';
import { MainLevel } from './snowball/levels/main-level.js';

const { Scene, PerspectiveCamera } = self.THREE;

export class SnowballGame extends Game {
  constructor() {
    super();

    this.collisionSystem = new Collision2DSystem(object => object.collider);
    this.effectSystem = new EffectSystem();
    this.snowballSystem = new SnowballSystem();
    this.mapSystem = new MapSystem(64, 64, 64.0);
    this.playerSystem = new PlayerSystem();
    this.dummyTargetSystem = new DummyTargetSystem();

    this.renderSystem.renderer.setClearColor(0x71A7DB, 1.0);
    this.level = new MainLevel();
  }

  setup() {
    super.setup();

    this.mapSystem.setup(this);
    this.playerSystem.setup(this);
  }

  update() {
    super.update();

    this.collisionSystem.update(this);
    this.snowballSystem.update(this);
    this.effectSystem.update(this);
    this.playerSystem.update(this);
    this.mapSystem.update(this);
    this.dummyTargetSystem.update(this);
  }
};

customElements.define('snowball-game', SnowballGame);
