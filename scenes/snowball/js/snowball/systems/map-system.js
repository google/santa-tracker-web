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

import { MagicHexGrid } from '../utils/magic-hex-grid.js';
import { HexMap } from '../entities/hex-map.js';
import { Obstacles } from '../entities/obstacles.js';
import { GameMap } from '../components/game-map.js';
import { Tree } from '../entities/static/tree.js';
import { DestinationMarker } from '../entities/destination-marker.js';

const { Object3D } = self.THREE;

const destinationMarker = new DestinationMarker();

export class MapSystem {
  constructor(unitWidth = 32, unitHeight = 32, tileScale = 32) {
    this.grid = new MagicHexGrid(unitWidth, unitHeight, tileScale);

    this.map = null;

    this.mapLayer = new Object3D();
    this.hexMap = new HexMap();
    this.obstacles = new Obstacles();
    this.obstacleCollidables = new Set();
    this.destinationMarker = new DestinationMarker();

    const gimbal = new Object3D();

    gimbal.rotation.x = 4 * Math.PI / 5;
    gimbal.add(this.hexMap);
    gimbal.add(this.obstacles);
    gimbal.add(this.destinationMarker);

    this.mapLayer.add(gimbal);

    this.gimbal = gimbal;
    this.mapLayer.add(gimbal);

    this.pickHandlers = [];
  }

  teardown(game) {
    this.hexMap.teardown(game);
  }

  handleMapPick(handler) {
    this.pickHandlers.push(handler);

    return () => {
      const index = this.pickHandlers.indexOf(handler);
      this.pickHandlers.splice(index, 1);
    };
  }

  onMapPicked(event) {
    const hit = event.detail.hits.get(this.hexMap.inputSurface)[0];
    const index = this.grid.hitToIndex(hit);
    const position = this.grid.hitToPosition(hit);
    const pickEvent = { index, position };

    this.pickHandlers.forEach(handler => {
      handler(pickEvent);
    });
  }

  setup(game) {
    this.obstacles.setup(game);
    this.destinationMarker.setup(game);
    this.hexMap.setup(game);

    this.hexMap.handlePick(event => this.onMapPicked(event));
  }

  update(game) {
    const { clientSystem } = game;
    const { player: clientPlayer } = clientSystem;

    this.obstacles.update(game);
    this.hexMap.update(game);

    if (!clientPlayer) {
      return;
    }
    const destinationReached = clientPlayer.path.destinationReached;

    if (destinationReached && this.destinationMarker.visible) {
      this.destinationMarker.visible = false;
    } else if (!destinationReached) {
      this.destinationMarker.position.x = clientPlayer.path.destination.x;
      this.destinationMarker.position.y = clientPlayer.path.destination.y - 20.0;

      this.destinationMarker.visible = true;
    }
  }

  rebuildMap(game, seed) {
    this.obstacleCollidables.forEach((tree) => {
      game.collisionSystem.removeCollidable(tree);
    });

    this.map = new GameMap(this.grid, seed);
    this.hexMap.map = this.map;
    this.obstacles.map = this.map;

    this.obstacleCollidables = new Set();
    // NOTE(cdata): IE11 does not have Float32Array.prototype.forEach
    Array.from(this.map.tileObstacles.array)
        .forEach((obstacle, index) => {
          if (obstacle < 0) {
            return;
          }

          const position = this.grid.indexToPosition(index);
          position.y -= this.grid.cellSize / 2.0;
          const tree = new Tree(index, position);

          tree.setup(game);

          game.collisionSystem.addCollidable(tree);
          this.obstacleCollidables.add(tree);
        });
  }
};
