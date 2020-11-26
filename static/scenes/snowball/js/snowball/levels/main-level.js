/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Level } from '../../engine/core/level.js';
import { Rectangle } from '../../engine/utils/collision-2d.js';
import { TetheredCameraTracker } from '../utils/camera-tracking.js';
import { Drop } from '../entities/drop.js';
import { PowerupUi } from '../ui/powerup-ui.js';
import { PopulationUi } from '../ui/population-ui.js';

const { AmbientLight } = self.THREE;

export class MainLevel extends Level {
  setup(game) {
    const {
      camera,
      collisionSystem,
      snowballSystem,
      parachuteSystem,
      entityRemovalSystem,
      dropSystem,
      effectSystem,
      playerSystem,
      clientSystem,
      lodSystem,
      mapSystem,
      stateSystem
    } = game;

    const { snowballLayer } = snowballSystem;
    const { playerLayer } = playerSystem;
    const { mapLayer, grid, map, gimbal } = mapSystem;
    const { effectsLayer } = effectSystem;
    const { collisionDebugLayer } = collisionSystem;
    const { parachuteLayer } = parachuteSystem;
    const { icebergLayer } = entityRemovalSystem;
    const { dropLayer } = dropSystem;

    this.unsubscribe = mapSystem.handleMapPick(event => this.pickEvent = event);
    this.cameraTracker = new TetheredCameraTracker(camera);
    this.light = new AmbientLight(0xbbaaaa, Math.PI);
    this.powerupUi = new PowerupUi();
    this.populationUi = new PopulationUi();

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

    game.shadowRoot.insertBefore(this.powerupUi,
        game.shadowRoot.firstElementChild);

    game.shadowRoot.insertBefore(this.populationUi,
        game.shadowRoot.firstElementChild);
    this.populationUi.hidden = true;
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

    this.powerupUi.update(game);
    this.populationUi.update(game);

    this.pickEvent = null;
  }
}
