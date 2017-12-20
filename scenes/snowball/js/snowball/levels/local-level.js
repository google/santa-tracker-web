import { MainLevel } from './main-level.js';

export class LocalLevel extends MainLevel {
  setup(game) {
    super.setup(game);

    const {
      clientSystem,
      dropSystem,
      mapSystem,
      playerSystem,
      botSystem
    } = game;

    this.lastErosionTick = 0;
    this.lastDropTick = 0;
    this.lastBotTick = 0;
    this.startTime = +new Date;

    const seed = (Math.random() * 0x100000000) & 0xffffffff;  // 32bit int
    mapSystem.rebuildMap(game, seed);

    const id = 'local';
    const player = playerSystem.addPlayer(id, -1);
    clientSystem.assignPlayer(player);

    for (let i = 0; i < Math.floor(game.maximumPlayers / 4); ++i) {
      dropSystem.addDrop();
      botSystem.addBot();
    }
  }

  update(game) {
    super.update(game);

    const {
      mapSystem,
      dropSystem,
      botSystem,
      stateSystem,
      tick
    } = game;

    const { map } = mapSystem;
    const { population } = stateSystem;

    // 300000 ms / 30 drops / 16 ms/f = 625 f/drop
    if (map && (tick - this.lastDropTick) > 625) {
      this.lastDropTick = tick;
      dropSystem.addDrop();
    }

    if (map && (tick - this.lastErosionTick) > 16) {
      this.lastErosionTick = tick;
      map.erode();
    }

    if (population.allTime < population.maximum) {
      if (map && (tick - this.lastBotTick) > 128) {
        botSystem.addBot();
        this.lastBotTick = tick;
      }
    }

    if (population.knockedOut >= (population.maximum - 1)) {
      // TODO(cdata): Is there a special victory screen?
      window.santaApp.fire('game-stop', {
        score: population.knockedOut,
      });
      window.ga('send', 'event', 'game', 'win', 'snowball');
    }
  }
}
