import { Level } from '../../engine/core/level.js';
import { combine } from '../../engine/utils/function.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { HexMap } from '../entities/hex-map.js';

export class MainLevel extends Level {
  setup(game) {
    console.log('Setup!');
    const { collisionSystem, snowballSystem } = game;
    const { snowballLayer } = snowballSystem;


    this.hexMap = new HexMap(32, 32);

    collisionSystem.bounds = Rectangle.allocate(
        this.hexMap.width, this.hexMap.height, this.hexMap.position);

    this.hexMap.setup(game);
    this.add(this.hexMap);

    snowballLayer.position.copy(this.hexMap.position);
    snowballLayer.position.z = -50;

    this.add(snowballLayer);

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
