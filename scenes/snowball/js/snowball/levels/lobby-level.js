import { Level } from '../../engine/core/level.js';
import { LobbyStatus } from '../ui/lobby-status.js';

export class LobbyLevel extends Level {
  constructor(...args) {
    super(...args);

    this.lobbyStatus = new LobbyStatus();
  }

  setup(game) {
    game.shadowRoot.appendChild(this.lobbyStatus);
  }

  teardown(game) {
    game.shadowRoot.removeChild(this.lobbyStatus);
  }

  update(game) {
    this.lobbyStatus.update(game);
  }
};
