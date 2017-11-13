import { Level } from '../../engine/core/level.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { TetheredCameraTracker } from '../utils/camera-tracking.js';

const { AmbientLight } = self.THREE;

export class MainLevel extends Level {
  constructor(seed=0) {
    super();
    this.mapSeed = seed;
  }

  setup(game) {
    const {
      camera,
      collisionSystem,
      snowballSystem,
      parachuteSystem,
      icebergSystem,
      effectSystem,
      playerSystem,
      clientSystem,
      lodSystem,
      mapSystem
    } = game;

    const { snowballLayer } = snowballSystem;
    const { playerLayer } = playerSystem;
    const { mapLayer, grid, map, gimbal } = mapSystem;
    const { effectsLayer } = effectSystem;
    const { collisionDebugLayer } = collisionSystem;
    const { parachuteLayer } = parachuteSystem;
    const { icebergLayer } = icebergSystem;

    this.unsubscribe = mapSystem.handleMapPick(event => this.pickEvent = event);
    this.cameraTracker = new TetheredCameraTracker(camera);
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
    gimbal.add(parachuteLayer);
    gimbal.add(icebergLayer);

    this.add(mapLayer);
    this.add(this.light);

    this.lastErosionTick = 0;

    mapSystem.regenerateMapWithSeed(this.mapSeed);
    clientSystem.setPendingSpawn(-1);  // TODO(samthor): Do better than random position.
  }

  measure(game) {
    const { camera, collisionSystem, lodSystem } = game;

    Rectangle.free(this.lodLimit);

    this.lodLimit = Rectangle.allocate(
        game.width + 256, game.height * 4/3 + 256);

    this.cameraTracker.tetherDistance = 0.05 * Math.max(game.width, game.height);
    lodSystem.limit = this.lodLimit;
    collisionSystem.limit = this.lodLimit;
  }

  teardown(game) {
    this.unsubscribe();

    game.clientSystem.reset(game);
    game.playerSystem.clearAllPlayers();
    game.parachuteSystem.reset();

    this.remove(game.mapSystem.mapLayer);
    this.remove(game.effectSystem.effectsLayer);
    this.remove(game.snowballSystem.snowballLayer);
    this.remove(game.playerSystem.playerLayer);
    this.remove(this.light);
  }

  update(game) {
    const { camera, mapSystem, clientSystem } = game;
    const { player: clientPlayer } = clientSystem;
    const { grid, map } = mapSystem;

    if (map && (game.tick - this.lastErosionTick) > 16) {
      this.lastErosionTick = game.tick;
      map.erode();  // TODO(samthor): The number of calls should be synchronized with server state.
    }

    if (this.pickEvent != null) {
      if (clientPlayer && clientPlayer.health.alive) {
        clientSystem.assignDestination(this.pickEvent);

        // Set target only if arrived, otherwise the player is a child of parachute and has a
        // position of (0,0,0).
        if (clientPlayer.arrival.arrived &&
          !clientPlayer.presence.exiting &&
          !clientPlayer.presence.gone) {
          this.cameraTracker.target = clientPlayer;
        }
      } else {
        this.cameraTracker.target = this.pickEvent;
      }
      this.pickEvent = null;
    }

    this.cameraTracker.update(game);
  }
}
