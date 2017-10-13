import { Game } from './engine/core/game.js';
import { MainLevel } from './snowball/levels/main-level.js';

const { Scene, PerspectiveCamera } = self.THREE;

export class Snowball extends Game {
  constructor() {
    super();

    this.renderSystem.renderer.setClearColor(0x71A7DB, 1.0);
    this.level = new MainLevel();
  }
};

customElements.define('snowball-game', Snowball);
