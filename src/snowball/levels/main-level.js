import { Level } from '../../engine/core/level.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { TetheredCameraTracker } from '../utils/camera-tracking.js';
import { Drop } from '../entities/drop.js';

const { AmbientLight } = self.THREE;

export class MainLevel extends Level {
  setup(game) {
    const {
      camera,
      collisionSystem,
      snowballSystem,
      parachuteSystem,
      icebergSystem,
      dropSystem,
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
    const { dropLayer } = dropSystem;

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
    gimbal.add(dropLayer);

    this.add(mapLayer);
    this.add(this.light);
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
    const { mapSystem, clientSystem, dropSystem } = game;
    const { player: clientPlayer } = clientSystem;

    if (clientPlayer) {
      if (clientPlayer.health.alive) {
        this.cameraTracker.target = clientPlayer;

        if (this.pickEvent != null) {
          clientSystem.assignDestination(this.pickEvent);
        }

        // Update camera only if arrived, otherwise the player is a child of
        // parachute and has a position of (0,0,0).
        if (clientPlayer.arrival.arrived &&
          !clientPlayer.presence.exiting &&
          !clientPlayer.presence.gone) {
          this.cameraTracker.update(game);
        }
      } else if (clientPlayer.health.dead) {
        if (this.pickEvent != null) {
          this.cameraTracker.target = this.pickEvent;
        }

        if (this.cameraTracker.target !== clientPlayer) {
          this.cameraTracker.update(game);
        }
      }
    }

    this.pickEvent = null;
  }
}
