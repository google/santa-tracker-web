const { Math: ThreeMath } = self.THREE;

export class ClientSystem {
  constructor(clientId = ThreeMath.generateUUID()) {
    // NOTE(cdata): This wll probably be provided by the game service:
    this.clientId = clientId;

    this.player = null;
    this.targetedPosition = null;
    this.destination = null;
    this.path = null;
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
    const { networkSystem, playerSystem } = game;
    const { playerId } = this.player;
    const { clientId, destination, targetedPosition } = this;

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
