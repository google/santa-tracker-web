import { Level } from '../../engine/core/level.js';
import { combine } from '../../engine/utils/function.js';
import { HexMap } from '../entities/hex-map.js';

export class MainLevel extends Level {
  setup(game) {
    console.log('Setup!');

    this.hexMap = new HexMap(32, 32);
    this.hexMap.setup(game);
    this.add(this.hexMap);

    this.lastErosionTick = 0;
  }

  teardown(game) {
    this.hexMap.teardown(game);
    this.remove(this.hexMap);
  }

  update(game) {
    if ((game.tick - this.lastErosionTick) > 16) {
      this.lastErosionTick = game.tick;
      this.hexMap.erode(Math.floor(Math.random() * 3));
    }

    this.hexMap.update(game);
  }
}
