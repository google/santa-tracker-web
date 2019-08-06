import { Component } from './component.js';

export class Arrival extends Component {
  constructor(tileIndex) {
    super();
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
