export class NetworkSystem {
  setup(game) {
    const { clientSystem } = game;
    const { clientId } = clientSystem;
    // Open socket connection...
    // ...
    this.destination = null;
    this.targetedPosition = null;
  }

  postDestination(destination) {}
  postTargetedPosition(targetedPosition) {}

  update(game) {}

};
