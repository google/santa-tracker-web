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
import { EntityRemovalSystem } from './snowball/systems/entity-removal-system.js';
import { DropSystem } from './snowball/systems/drop-system.js';
import { LocalLevel } from './snowball/levels/local-level.js';
import { NetworkLevel } from './snowball/levels/network-level.js';

const { Scene, PerspectiveCamera } = self.THREE;

export class SnowballGame extends Game {
  constructor() {
    super();

    this.collisionSystem = new Collision2DSystem(object => object.collider || object);
    this.lodSystem = new LodSystem();
    this.effectSystem = new EffectSystem();
    this.snowballSystem = new SnowballSystem();
    this.parachuteSystem = new ParachuteSystem();
    this.entityRemovalSystem = new EntityRemovalSystem();
    this.dropSystem = new DropSystem();
    this.mapSystem = new MapSystem(64.0, 64.0, 64.0);
    this.clientSystem = new ClientSystem();
    this.networkSystem = new NetworkSystem();
    this.playerSystem = new PlayerSystem();

    this.renderSystem.renderer.setClearColor(0x71A7DB, 1.0);
  }

  get networkLevelType() {
    return NetworkLevel;
  }

  get localLevelType() {
    return LocalLevel;
  }

  setup() {
    super.setup();

    this.mapSystem.setup(this);
    this.playerSystem.setup(this);
    this.clientSystem.setup(this);
    this.networkSystem.setup(this);
    this.dropSystem.setup(this);
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
    this.playerSystem.update(this);
  }

  start() {
    const LevelClass = this.localLevelType;
    this.level = LevelClass();
  }
};

customElements.define('snowball-game', SnowballGame);
