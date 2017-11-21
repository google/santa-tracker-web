export class Arrival {
  constructor(tileIndex) {
    this.droppedTick = Infinity;
    this.arrived = false;
    this.tileIndex = tileIndex;
  }

  isDropping() {
    return this.droppedTick < Infinity && !this.arrived;
  }

  droppedAt(tick) {
    this.droppedTick = tick;
  }

  arrive() {
    this.arrived = true;
  }
};
