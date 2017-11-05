import { Level } from '../../engine/core/level.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { HexMap } from '../entities/hex-map.js';
import { Elf } from '../entities/elf.js';
import { TetheredCameraTracker } from '../utils/camera-tracking.js';

const { Vector2 } = self.THREE;

export class MainLevel extends Level {
  setup(game) {
    console.log('Setup!');
    const {
      camera,
      collisionSystem,
      snowballSystem,
      effectSystem,
      playerSystem,
      dummyTargetSystem,
      mapSystem
    } = game;
    const { snowballLayer } = snowballSystem;
    const { playerLayer, player } = playerSystem;
    const { dummyTargetLayer } = dummyTargetSystem;
    const { mapLayer, grid, map, gimbal } = mapSystem;
    const { effectsLayer } = effectSystem;
    const { collisionDebugLayer } = collisionSystem;

    this.unsubscribe = mapSystem.handleMapPick(event => this.pickEvent = event);
    this.cameraTracker = new TetheredCameraTracker(camera, player);

    collisionSystem.bounds = Rectangle.allocate(
       grid.pixelWidth, grid.pixelHeight, mapLayer.position);

    if (collisionSystem.debug) {
      collisionDebugLayer.position.z = grid.cellSize / 4.0 + 1.0;
      gimbal.add(collisionDebugLayer);
    }

    gimbal.add(snowballLayer);
    gimbal.add(playerLayer);
    gimbal.add(dummyTargetLayer);
    gimbal.add(effectsLayer);

    this.add(mapLayer);

    this.lastErosionTick = 0;
  }

  teardown(game) {
    this.unsubscribe();

    this.remove(game.mapSystem.mapLayer);
    this.remove(game.effectSystem.effectsLayer);
    this.remove(game.snowballSystem.snowballLayer);
    this.remove(game.playerSystem.playerLayer);
  }

  update(game) {
    const { camera, mapSystem, playerSystem } = game;
    const { grid, map } = mapSystem;
    const { player } = playerSystem;

    if ((game.tick - this.lastErosionTick) > 16) {
      this.lastErosionTick = game.tick;
      map.erode(Math.floor(Math.random() * 3));
    }

    if (this.pickEvent != null) {
      const { index, sprite, state, position } = this.pickEvent;

      const playerIndex = grid.positionToIndex(player.position);
      const tileIsPassable = (grid, currentIndex) => {
        const state = map.getTileState(currentIndex);
        const sprite = map.getTileObstacle(currentIndex);

        return state > 0 && state < 3 && sprite < 0;
      };

      const waypoints = grid.waypoints(playerIndex, index, tileIsPassable);

      if (waypoints.length) {
        const path = waypoints.slice(1, waypoints.length - 1)
            .map(index => {
              //map.setTileState(index, 2.0);
              return grid.indexToPosition(index)
            });

        path.push(position);
        playerSystem.assignPath(path);
        console.log(playerIndex, index, path.slice());
      } else {
        playerSystem.throwSnowballAt(position);
      }

      this.pickEvent = null;
    }

    this.cameraTracker.update(game);
  }
}
