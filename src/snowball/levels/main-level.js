import { Level } from '../../engine/core/level.js';
import { combine } from '../../engine/utils/function.js';
import { Map } from '../entities/map.js';
import { FastMap } from '../entities/fastmap.js';

export class MainLevel extends Level {
  setup(game) {
    console.log('Setup!');

    const fastMap = this.fastMap = new FastMap();
    this.fastMap.setup(game);
    this.add(this.fastMap);
  }

  teardown(game) {
    this.fastMap.teardown(game);
    this.remove(this.fastMap);
    this.map = null;
  }

  update(game) {
    this.fastMap.update(game);
  }
}
