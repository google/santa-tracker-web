import { PlayerMarker } from '../entities/player-marker.js';

const {
  Math: ThreeMath,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial
} = self.THREE;

const localClientId = 'local';

export class ClientSystem {
  constructor() {
    this.player = null;
    this.targetedPosition = null;
    this.destination = null;
    this.pendingSpawnAt = null;

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

  setPendingSpawn(at) {
    this.pendingSpawnAt = at;
  }

  reset(game) {
    const { playerSystem } = game;

    if (this.player) {
      playerSystem.removePlayer(this.player.playerId);
    }

    const { arrivalMarker } = this;
    if (arrivalMarker.parent != null) {
      arrivalMarker.parent.remove(arrivalMarker);
    }

    this.player = null;
  }

  setup(game) {}

  update(game) {
    if (!this.player) {
      if (this.pendingSpawnAt == null) {
        return;
      }
      const { playerSystem, currentLevel } = game;
      this.player = playerSystem.addPlayer(localClientId, this.pendingSpawnAt);
      if (currentLevel) {
        // TODO(samthor): This assignment is a bit awkward.
        currentLevel.cameraTracker.target = this.player;
      }
      this.pendingSpawnAt = null;
    }

    const { camera } = game;
    const { playerId, health, path, arrival } = this.player;

    if (health.dead) {
      return;
    }

    const { networkSystem, playerSystem, mapSystem } = game;
    const { grid } = mapSystem;
    const { destination, targetedPosition, arrivalMarker } = this;

    if (!arrival.arrived) {
      if (arrivalMarker.parent == null && arrival.tileIndex > -1) {
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
