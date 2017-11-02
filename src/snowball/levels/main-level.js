import { Level } from '../../engine/core/level.js';
import { combine } from '../../engine/utils/function.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { HexMap } from '../entities/hex-map.js';
import { Elf } from '../entities/elf.js';

const { Vector2 } = self.THREE;

export class MainLevel extends Level {
  setup(game) {
    console.log('Setup!');
    const {
      collisionSystem,
      snowballSystem,
      effectSystem,
      playerSystem,
      dummyTargetSystem,
      hexSystem
    } = game;
    const { snowballLayer } = snowballSystem;
    const { playerLayer } = playerSystem;
    const { dummyTargetLayer } = dummyTargetSystem;
    const { hexLayer } = hexSystem;
    const { effectsLayer } = effectSystem;

    this.unsubscribe = hexSystem.handleMapPick(event => this.pickEvent = event);

    collisionSystem.bounds = Rectangle.allocate(
       hexLayer.width, hexLayer.height, hexLayer.position);

    snowballLayer.position.copy(hexLayer.position);
    effectsLayer.position.copy(hexLayer.position);

    snowballLayer.position.z = effectsLayer.position.z =
        hexLayer.height / -2 - 35.0;

    playerLayer.position.z = dummyTargetLayer.position.z =
        hexLayer.height / -2 - 37.5;

    this.add(hexLayer);
    this.add(snowballLayer);
    this.add(playerLayer);
    this.add(dummyTargetLayer);
    this.add(effectsLayer);

    this.lastErosionTick = 0;
  }

  teardown(game) {
    this.unsubscribe();

    this.remove(game.hexSystem.hexLayer);
    this.remove(game.effectSystem.effectsLayer);
    this.remove(game.snowballSystem.snowballLayer);
    this.remove(game.playerSystem.playerLayer);
  }

  update(game) {
    const { hexSystem, playerSystem } = game;
    const { hexLayer } = hexSystem;

    if ((game.tick - this.lastErosionTick) > 16) {
      this.lastErosionTick = game.tick;
      hexLayer.erode(Math.floor(Math.random() * 3));
    }

    const { grid } = hexSystem;

    if (this.pickEvent != null) {
      const { index, sprite, state, position } = this.pickEvent;
      const { player } = playerSystem;

      const playerIndex = grid.positionToIndex(player.position);
      const tileIsPassable = (grid, currentIndex) => {
        const state = hexLayer.getTileState(currentIndex);
        const sprite = hexLayer.getTileSprite(currentIndex);

        return state > 0 && state < 3 && sprite > 3;
      };

      const waypoints = grid.waypoints(playerIndex, index, tileIsPassable);

      if (waypoints.length) {
        const path = waypoints.slice(1, waypoints.length - 1)
            .map(index => {
              //hexLayer.setTileState(index, 2.0);
              return grid.indexToPosition(index)
            });

        path.push(position);
        playerSystem.assignPath(path);
        console.log(playerIndex, index, waypoints);
      } else {
        playerSystem.throwSnowballAt(position);
      }

      this.pickEvent = null;
    }

    hexLayer.update(game);
  }
}
