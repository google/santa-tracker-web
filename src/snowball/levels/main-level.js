import { Level } from '../../engine/core/level.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { HexMap } from '../entities/hex-map.js';
import { Elf } from '../entities/elf.js';
import { TetheredCameraTracker } from '../utils/camera-tracking.js';

const { AmbientLight } = self.THREE;

export class MainLevel extends Level {
  setup(game) {
    console.log('Setup!');
    const {
      camera,
      collisionSystem,
      snowballSystem,
      effectSystem,
      playerSystem,
      clientSystem,
      lodSystem,
      mapSystem
    } = game;

    const { snowballLayer } = snowballSystem;
    const { playerLayer } = playerSystem;
    const { player } = clientSystem;
    const { mapLayer, grid, map, gimbal } = mapSystem;
    const { effectsLayer } = effectSystem;
    const { collisionDebugLayer } = collisionSystem;

    this.unsubscribe = mapSystem.handleMapPick(event => this.pickEvent = event);
    this.cameraTracker = new TetheredCameraTracker(camera, player);
    this.light = new AmbientLight(0xbbaaaa, Math.PI);

    this.measure(game);

    collisionSystem.bounds = Rectangle.allocate(
       grid.pixelWidth, grid.pixelHeight, mapLayer.position);

    if (collisionSystem.debug) {
      collisionDebugLayer.position.z = grid.cellSize / 4.0 + 1.0;
      gimbal.add(collisionDebugLayer);
    }

    gimbal.add(snowballLayer);
    gimbal.add(playerLayer);
    gimbal.add(effectsLayer);

    this.add(mapLayer);
    this.add(this.light);

    this.lastErosionTick = 0;
  }

  measure(game) {
    const { collisionSystem, lodSystem, clientSystem } = game;
    const { player } = clientSystem;

    Rectangle.free(this.lodLimit);

    this.lodLimit = Rectangle.allocate(
        game.width + 256, game.height * 4/3 + 256, player.position);


    this.cameraTracker.tetherDistance = 0.05 * Math.max(game.width, game.height);
    lodSystem.limit = this.lodLimit;
    collisionSystem.limit = this.lodLimit;
  }

  teardown(game) {
    this.unsubscribe();

    this.remove(game.mapSystem.mapLayer);
    this.remove(game.effectSystem.effectsLayer);
    this.remove(game.snowballSystem.snowballLayer);
    this.remove(game.playerSystem.playerLayer);
    this.remove(this.light);
  }

  update(game) {
    const { camera, mapSystem, playerSystem, clientSystem } = game;
    const { grid, map } = mapSystem;

    if ((game.tick - this.lastErosionTick) > 16) {
      this.lastErosionTick = game.tick;
      const maxErodedTiles = Math.ceil(map.tileRings.length / 5) * 3.0;
      map.erode(Math.floor(Math.random() * maxErodedTiles));
    }

    if (this.pickEvent != null) {
      clientSystem.assignDestination(this.pickEvent);
      this.pickEvent = null;
    }

    this.cameraTracker.update(game);
  }
}
