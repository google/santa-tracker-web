import { Drop } from '../entities/drop.js';
import { randomValue } from '../../engine/utils/function.js';

const {
  Object3D,
  Vector2
} = self.THREE;

export const dropType = {
  NOTHING: 0
};

const intermediateVector2 = new Vector2();

export class DropSystem {
  setup(game) {
    this.newDrops = [];
    this.parachutingDrops = [];
    this.drops = [];
    this.dropLayer = new Object3D();
  }

  reset(game) {
  }

  addDrop(tileIndex = -1, type = randomValue(dropType)) {
    const drop = Drop.allocate();
    drop.setup(game);

    drop.arrival.tileIndex = tileIndex;
    drop.contents.inventory.push(type);

    this.drops.push(drop);
    this.newDrops.push(drop);
  }

  update(game) {
    const { icebergSystem, mapSystem, parachuteSystem } = game;
    const { map, grid } = mapSystem;

    while (this.newDrops.length) {
      const drop = this.newDrops.shift();
      const { arrival } = drop;

      this.parachutingDrops.push(drop);

      if (arrival.tileIndex < 0) {
        arrival.tileIndex = map.getRandomHabitableTileIndex();
      }

      parachuteSystem.dropEntity(drop);
    }

    for (let i = 0; i < this.parachutingDrops.length; ++i) {
      const drop = this.parachutingDrops[i];
      const { arrival } = drop;

      if (arrival.arrived) {
        this.parachutingDrops.splice(i--, 1);

        const position = grid.indexToPosition(
            arrival.tileIndex, intermediateVector2);

        drop.position.x = position.x;
        drop.position.y = position.y;

        this.dropLayer.add(drop);
      }
    }

    for (let i = 0; i < this.drops.length; ++i) {
      const drop = this.drops[i];
      const { arrival, presence } = drop;

      if (arrival.arrived) {
        drop.update(game);
      }

      const tileIndex = grid.positionToIndex(drop.position);
      const tileState = map.getTileState(tileIndex);

      if (tileState === 4.0 && presence.present && !presence.exiting) {
        icebergSystem.freezeEntity(drop);
        presence.exiting = true;
      } else if (presence.gone) {
        this.drops.splice(i--, 1);
        Drop.free(drop);
      }
    }
  }
};
