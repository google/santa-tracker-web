import { Drop } from '../entities/drop.js';
import { randomValue } from '../../engine/utils/function.js';

const {
  Object3D,
  Vector2
} = self.THREE;

export const itemType = {
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

  addDrop(tileIndex = -1, containedItem = randomValue(itemType)) {
    const drop = Drop.allocate();
    drop.setup(game);

    drop.arrival.tileIndex = tileIndex;
    drop.contents.inventory.push(containedItem);

    this.drops.push(drop);
    this.newDrops.push(drop);
  }

  update(game) {
    const {
      playerSystem,
      collisionSystem,
      icebergSystem,
      mapSystem,
      parachuteSystem
    } = game;
    const { map, grid } = mapSystem;

    if (map == null) {
      return;
    }

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

        collisionSystem.addCollidable(drop);
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

      if (arrival.arrived) {
        if (!presence.gone) {
          if (!presence.exiting) {
            if (tileState === 4.0) {
              collisionSystem.removeCollidable(drop);
              icebergSystem.freezeEntity(drop);
            } else if (drop.collidingPlayer != null) {
              playerSystem.assignPlayerItem(
                  drop.collidingPlayer.playerId, drop.contents.inventory[0]);
              drop.collidingPlayer = null;
              drop.spin();
            }
          }
        } else {
          if (drop.parent === this.dropLayer) {
            this.dropLayer.remove(drop);
          }

          this.drops.splice(i--, 1);
          Drop.free(drop);
        }
      }
    }
  }
};
