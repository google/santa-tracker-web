import { Elf } from '../entities/elf.js';

const {
  Math: ThreeMath,
  Object3D,
  Vector2,
  Vector3
} = self.THREE;

const intermediateVector2 = new Vector2();
const PI_OVER_TWO = Math.PI / 2.0;

export class PlayerSystem {
  setup(game) {
    this.path = null;
    this.playerLayer = new Object3D();
    this.playerMap = {};
    this.players = [];
    this.newPlayers = [];
    this.parachutingPlayers = [];

    this.playerDestinations = {};
    this.playerTargetedPositions = {};
  }

  hasPlayer(id) {
    return !!this.playerMap[id];
  }

  addPlayerFromJson(playerJson) {
    const player = this.addPlayerInstance(Elf.fromJson(playerJson));
    const { path } = playerJson;
    const { destination } = path;

    if (destination != null) {
      this.assignPlayerDestination(player.playerId, {
        index: destination.index,
        position: new Vector3().copy(destination.position)
      });
    }

    return player;
  }

  addPlayer(id = ThreeMath.generateUUID(), startingTileIndex = -1) {
    if (this.playerMap[id]) {
      throw new Error(`player ${id} already described`);
    }

    return this.addPlayerInstance(Elf.allocate(id, startingTileIndex));
  }

  addPlayerInstance(player) {
    this.playerMap[player.playerId] = player;
    this.players.push(player);
    this.newPlayers.push(player);
    return player;
  }

  getPlayer(id) {
    return this.playerMap[id];
  }

  clearAllPlayers() {
    const all = Object.keys(this.playerMap);
    all.forEach((id) => this.removePlayer(id));
  }

  removePlayer(id) {
    const player = this.playerMap[id];
    if (player === undefined) {
      return;
    }

    this.playerLayer.remove(player);
    Elf.free(player);

    const possibleArrays = [this.players, this.newPlayers, this.parachutingPlayers];
    possibleArrays.forEach((array) => {
      const index = array.indexOf(player);
      if (index !== -1) {
        array.splice(index, 1);
      }
    });

    const possibleObjects =
        [this.playerMap, this.playerDestinations, this.playerTargetedPositions];
    possibleObjects.forEach((object) => delete object[id]);
  }

  assignPlayerPowerup(playerId, powerupType) {
    console.log(`Player ${playerId} collected powerup ${powerupType}`);
    const player = this.playerMap[playerId];
    const { powerups } = player;

    powerups.collect(powerupType);
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

    player.hasAssignedTarget = true;
  }

  update(game) {
    const {
      mapSystem,
      snowballSystem,
      clientSystem,
      parachuteSystem,
      entityRemovalSystem
    } = game;
    const { grid, map } = mapSystem;
    const { player: clientPlayer } = clientSystem;

    if (map == null) {
      return;
    }

    // New players are passed through the parachute system...
    while (this.newPlayers.length) {
      const player = this.newPlayers.shift();
      const { arrival } = player;

      // This should never be true in practice, since the tile index is provided
      // by the game server. However, a player may be spawned when testing stuff
      // locally, so we will pick a random safe tile in this case:
      if (arrival.tileIndex < 0) {
        arrival.tileIndex = map.getRandomHabitableTileIndex();
      }

      player.setup(game);

      if (!arrival.arrived) {
        parachuteSystem.dropEntity(player);
        this.parachutingPlayers.push(player);
      }
    }

    // Arrived players are positioned and placed with existing players...
    for (let i = 0; i < this.parachutingPlayers.length; ++i) {
      const player = this.parachutingPlayers[i];

      if (player.arrival.arrived) {
        const { arrival } = player;

        const position = grid.indexToPosition(
            arrival.tileIndex, intermediateVector2);

        this.parachutingPlayers.splice(i--, 1);

        player.position.x = position.x;
        player.position.y = position.y;

        this.playerLayer.add(player);
      }
    }

    for (let playerId in this.playerDestinations) {
      const player = this.playerMap[playerId];

      if (player.health.dead || !player.arrival.arrived) {
        continue;
      }

      const destination = this.playerDestinations[playerId];
      const path = grid.playerWaypointsForMap(player, destination, map);

      if (path.length) {
        player.path.follow(path);
      } else if (player === clientPlayer) {
        clientSystem.assignTarget(destination);
      } else {
        console.debug('can\'t navigate', playerId, 'to', destination);
        // TODO(samthor): this should throw a snowball—where is the method?
        // clientSystem.assignTargetedPosition(destination.position);
      }
    }

    this.playerDestinations = {};

    for (let playerId in this.playerTargetedPositions) {
      const player = this.playerMap[playerId];

      if (player.health.dead) {
        continue;
      }

      const targetPosition = this.playerTargetedPositions[playerId];
      const partial = intermediateVector2;

      snowballSystem.throwSnowball(player, targetPosition);

      partial.subVectors(targetPosition, player.position).normalize();
      player.face(Math.atan2(partial.y, partial.x) + PI_OVER_TWO);
    }

    this.playerTargetedPositions = {};


    for (let i = 0; i < this.players.length; ++i) {
      const player = this.players[i];
      const { presence } = player;

      player.update(game);

      const tileIndex = grid.positionToIndex(player.position);
      const tileState = map.getTileState(tileIndex);

      if (tileState === 4.0 && presence.present && !presence.exiting) {
        player.sink();
        entityRemovalSystem.freezeEntity(player);
      } else if (presence.gone) {
        this.players.splice(i--, 1);

        if (player !== clientPlayer) {
          Elf.free(player);
          this.playerLayer.remove(player);
        }
      }
    }
  }
};
