import { MagicHexGrid } from '../utils/magic-hex-grid.js';
import { HexMap } from '../entities/hex-map.js';

export class HexSystem {
  constructor(unitWidth = 32, unitHeight = 32, tileScale = 32) {
    this.grid = new MagicHexGrid(unitWidth, unitHeight, tileScale);
    this.hexLayer = new HexMap(this.grid, event => this.onMapPicked(event));

    this.pickHandlers = [];
  }

  handleMapPick(handler) {
    this.pickHandlers.push(handler);

    return () => {
      const index = this.pickHandlers.indexOf(handler);
      this.pickHandlers.splice(index, 1);
    };
  }

  onMapPicked(event) {
    this.pickHandlers.forEach(handler => handler(event));
  }

  setup(game) {
    this.hexLayer.setup(game);
  }

  update(game) {
    this.hexLayer.update(game);
  }
};
