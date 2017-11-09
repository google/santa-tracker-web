import { Elf } from '../entities/elf.js';

const { Math: ThreeMath, Object3D, Vector2 } = self.THREE;

const intermediateVector2 = new Vector2();
const PI_OVER_TWO = Math.PI / 2.0;

export class PlayerSystem {
  setup(game) {
    this.path = null;
    this.playerLayer = new Object3D();
    this.playerMap = {};
    this.players = [];
    this.newPlayers = [];

    this.playerDestinations = {};
    this.playerTargetedPositions = {};
  }

  addPlayer(id = ThreeMath.generateUUID()) {
    const player = Elf.allocate(id);
    this.playerMap[id] = player;
    this.players.push(player);
    this.playerLayer.add(player);
    this.newPlayers.push(player);
    return player;
  }

  removePlayer(id) {
    const player = this.playerMap[id];
    const playerIndex = this.players.indexOf(player);

    if (playerIndex < 0) {
      return;
    }

    this.players.splice(playerIndex, 1);
    this.playerLayer.remove(player);
    Elf.free(player);
  }

  assignPlayerDestination(playerId, destination) {
    const player = this.playerMap[playerId];

    if (player != null) {
      this.playerDestinations[playerId] = destination;
    }
  }

  assignPlayerTargetedPosition(playerId, targetedPosition) {
    const player = this.playerMap[playerId];

    if (player != null) {
      this.playerTargetedPositions[playerId] = targetedPosition;
    }
  }

  update(game) {
    const { mapSystem, snowballSystem, clientSystem } = game;
    const { grid, map } = mapSystem;
    const { player: clientPlayer } = clientSystem;

    while (this.newPlayers.length) {
      const newPlayer = this.newPlayers.shift();
      newPlayer.setup(game);
    }

    for (let playerId in this.playerDestinations) {
      const player = this.playerMap[playerId];
      const destination = this.playerDestinations[playerId];
      const path = grid.playerWaypointsForMap(player, destination, map);

      if (path.length) {
        player.followPath(path);
      } else if (player === clientPlayer) {
        clientSystem.assignTarget(destination);
      } else {
        this.assignTargetedPosition(destination.position);
      }
    }

    this.playerDestinations = {};

    for (let playerId in this.playerTargetedPositions) {
      const player = this.playerMap[playerId];
      const targetPosition = this.playerTargetedPositions[playerId];
      const partial = intermediateVector2;

      snowballSystem.throwSnowball(player, targetPosition);

      partial.subVectors(targetPosition, player.position).normalize();
      player.face(Math.atan2(partial.y, partial.x) + PI_OVER_TWO);
    }

    this.playerTargetedPositions = {};


    for (let i = 0; i < this.players.length; ++i) {
      const player = this.players[i];
      player.update(game);

      const tileIndex = grid.positionToIndex(player.position);
      const tileState = map.getTileState(tileIndex);

      if (tileState === 4.0) {
        this.removePlayer(player.playerId);
      }
    }
  }
};
