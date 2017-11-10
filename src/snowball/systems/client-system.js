import { PlayerMarker } from '../entities/player-marker.js';

const {
  Math: ThreeMath,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial
} = self.THREE;

export class ClientSystem {
  constructor(clientId = ThreeMath.generateUUID()) {
    // NOTE(cdata): This wll probably be provided by the game service:
    this.clientId = clientId;

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
    const { playerSystem } = game;
    const player = playerSystem.addPlayer(this.clientId);
    this.player = player;
  }

  update(game) {
    const { playerId, health, path, arrival } = this.player;

    if (health.dead) {
      return;
    }

    const { networkSystem, playerSystem, mapSystem } = game;
    const { grid } = mapSystem;
    const { clientId, destination, targetedPosition, arrivalMarker } = this;

    if (!arrival.arrived) {
      if (arrivalMarker.parent == null) {

        arrivalMarker.position.z = 19.0;
        arrivalMarker.position.y = this.player.dolly.position.y;
        arrivalMarker.rotation.x = this.player.dolly.rotation.x;

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
