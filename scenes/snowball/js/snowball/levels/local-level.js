import { MainLevel } from './main-level.js';

export class LocalLevel extends MainLevel {
  setup(game) {
    super.setup(game);

    const { clientSystem, dropSystem, mapSystem, playerSystem } = game;

    this.lastErosionTick = 0;
    this.lastDropTick = 0;

    const seed = (Math.random() * 0x100000000) & 0xffffffff;  // 32bit int
    mapSystem.rebuildMap(game, seed);

    const id = 'local';
    const player = playerSystem.addPlayer(id, -1);
    clientSystem.assignPlayer(player);

    for (let i = 0; i < 15; ++i) {
      dropSystem.addDrop();
    }
  }

  update(game) {
    super.update(game);

    const { mapSystem, dropSystem } = game;
    const { map } = mapSystem;

    // 300000 ms / 30 drops / 16 ms/f = 625 f/drop
    if (map && (game.tick - this.lastDropTick) > 625) {
      this.lastDropTick = game.tick;
      dropSystem.addDrop();
    }

    if (map && (game.tick - this.lastErosionTick) > 16) {
      this.lastErosionTick = game.tick;
      map.erode();
    }
  }

}