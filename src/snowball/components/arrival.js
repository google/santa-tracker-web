export class Arrival {
  constructor() {
    this.droppedTick = Infinity;
    this.arrived = false;
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
