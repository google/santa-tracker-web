import { PlayerMarker } from '../entities/player-marker.js';

const {
  Math: ThreeMath,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial
} = self.THREE;

export class ClientSystem {
  constructor(clientId = ThreeMath.generateUUID(), startingTileIndex = -1) {
    // NOTE(cdata): This wll probably be provided by the game service:
    this.clientId = clientId;
    this.startingTileIndex = -1;

    this.player = null;
    this.targetedPosition = null;
    this.destination = null;

    const arrivalMarker = new PlayerMarker();
    arrivalMarker.material.depthTest = false;

    this.arrivalMarker = arrivalMarker;
  }

  assignTarget(target) {
    this.targetedPosition = target.position.clone();
  }

  assignDestination(destination) {
    this.destination = destination;
  }

  setup(game) {
    const { playerSystem, mapSystem } = game;
    const { map } = mapSystem;

    // This should never be true in practice, since the tile index is provided
    // by the game server. However, a player may be spawned when testing stuff
    // locally, so we will pick a random safe tile in this case:
    if (this.startingTileIndex < 0) {
      this.startingTileIndex = map.getRandomHabitableTileIndex();
    }

    const player = playerSystem.addPlayer(
        this.clientId, this.startingTileIndex);
    this.player = player;
  }

  update(game) {
    const { camera } = game;
    const { playerId, health, path, arrival } = this.player;

    if (health.dead) {
      return;
    }

    const { networkSystem, playerSystem, mapSystem } = game;
    const { grid } = mapSystem;
    const { clientId, destination, targetedPosition, arrivalMarker } = this;

    if (!arrival.arrived) {
      if (arrivalMarker.parent == null) {
        const position = grid.indexToPosition(arrival.tileIndex);

        arrivalMarker.position.z = 19.0;
        arrivalMarker.position.y = position.y + this.player.dolly.position.y;
        arrivalMarker.position.x = position.x;
        arrivalMarker.rotation.x = this.player.dolly.rotation.x;

        camera.position.x = position.x;
        camera.position.y = position.y * -0.75;

        playerSystem.playerLayer.add(arrivalMarker);
      }
    } else {
      if (arrivalMarker.parent != null) {
        arrivalMarker.parent.remove(arrivalMarker);
      }
    }

    if (destination != null) {
      playerSystem.assignPlayerDestination(playerId, destination);
      networkSystem.postDestination(destination);

      this.destination = null;
    }

    if (targetedPosition != null) {
      playerSystem.assignPlayerTargetedPosition(
          playerId, this.targetedPosition);
      networkSystem.postTargetedPosition(this.targetedPosition);

      this.targetedPosition = null;
    }
  }
};
