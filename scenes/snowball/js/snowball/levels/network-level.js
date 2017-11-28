import { MainLevel } from './main-level.js';

export class NetworkLevel extends MainLevel {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  setup(game) {
    super.setup(game);
    const { networkSystem } = game;

    this.socket.target = networkSystem;
    networkSystem.socket = this.socket;
  }
}
