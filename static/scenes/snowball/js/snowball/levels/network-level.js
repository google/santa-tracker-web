import { MainLevel } from './main-level.js';

export class NetworkLevel extends MainLevel {
  setup(game) {
    super.setup(game);

    this.lastErosionTick = this.lastDropTick = game.setupTick;
  }

  update(game) {
    super.update(game);

    const { mapSystem, tick } = game;
    const { map } = mapSystem;

    if (map != null) {
      const erosionTickDelta = tick - this.lastErosionTick;
      const erosions = Math.floor(erosionTickDelta / 32);

      if (erosions > 0) {
        //console.log(`Tick (Delta: ${erosionTickDelta}, #: ${erosions}):`, tick);
        for (let i = 0; i < erosions; ++i) {
          map.erode();
        }

        this.lastErosionTick = tick;
      }
    }
  }
}
