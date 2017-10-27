import { Game } from './engine/core/game.js';
import { Collision2DSystem } from './engine/systems/collision-2d-system.js';
import { SnowballSystem } from './snowball/systems/snowball-system.js';
import { MainLevel } from './snowball/levels/main-level.js';

const { Scene, PerspectiveCamera } = self.THREE;

export class Snowball extends Game {
  constructor() {
    super();

    this.collisionSystem = new Collision2DSystem();
    this.renderSystem.renderer.setClearColor(0x71A7DB, 1.0);
    this.level = new MainLevel();
  }
};

customElements.define('snowball-game', Snowball);
