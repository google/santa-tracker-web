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
import { RaisedTile } from '../entities/static/raised-tile.js';
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
    this.didSetup = false;
  }

  /**
   * Swaps in a differently-sized grid. This must happen before `setup()`:
   * the grid's pixel dimensions get baked into the hex map's shader uniform,
   * the obstacle layer and the `PlaneBufferGeometry` used for mouse picking,
   * none of which are rebuilt afterwards.
   */
  resize(unitWidth, unitHeight, tileScale) {
    if (this.didSetup) {
      console.warn(
          'MapSystem.resize called after setup; the map geometry is already ' +
          'built at the old size and will not match the new grid.');
      return;
    }

    this.grid = new MagicHexGrid(unitWidth, unitHeight, tileScale);
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
    this.didSetup = true;

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
    this.removeErodedObstacleCollidables(game);

    if (!clientPlayer) {
      return;
    }
    const destinationReached = clientPlayer.path.destinationReached;

    // The cross earns its place only on a click, where it answers "how far will
    // I travel" — something the heading chevron on the player marker cannot say.
    // A keyboard walk is always the same short look-ahead, so there the cross is
    // just a jittering mark two tiles in front of the elf.
    const showMarker = !destinationReached && clientSystem.destinationFromPointer;

    if (this.destinationMarker.visible !== showMarker) {
      this.destinationMarker.visible = showMarker;
    }

    if (showMarker) {
      this.destinationMarker.position.x = clientPlayer.path.destination.x;
      this.destinationMarker.position.y = clientPlayer.path.destination.y - 20.0;
    }
  }

  rebuildMap(game, seed) {
    this.obstacleCollidables.forEach((tree) => {
      game.collisionSystem.removeCollidable(tree);
    });

    const treeDensity = game.gameMode != null
        ? game.gameMode.treeDensity
        : undefined;

    this.map = new GameMap(this.grid, seed, treeDensity);
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

    // Raised tiles are walls for elves, so they should stop snowballs too.
    // Half the cell height is the hexagon's inradius, so the circles of two
    // neighbouring tiles meet exactly on their shared edge.
    const raisedTileRadius = this.grid.cellHeight / 2.0;

    for (let index = 0; index < this.map.tileCount; ++index) {
      if (this.map.getTileState(index) !== 5.0) {
        continue;
      }

      const raisedTile = new RaisedTile(
          index, this.grid.indexToPosition(index), raisedTileRadius);

      raisedTile.setup(game);

      game.collisionSystem.addCollidable(raisedTile);
      this.obstacleCollidables.add(raisedTile);
    }
  }

  /**
   * Obstacle colliders outlive the tile they sit on, which would leave an
   * invisible wall hanging over the water once that tile erodes away.
   */
  removeErodedObstacleCollidables(game) {
    if (this.map == null) {
      return;
    }

    this.obstacleCollidables.forEach((obstacle) => {
      const tileState = this.map.getTileState(obstacle.tileIndex);

      // Tile states are an enum, not a scale: 1 (visible), 2 (highlighted) and
      // 5 (raised) are all still solid ground. Only 0 (hidden), 3 (shaking)
      // and 4 (sinking) mean the tile is on its way into the water.
      if (tileState === 1.0 || tileState === 2.0 || tileState === 5.0) {
        return;
      }

      game.collisionSystem.removeCollidable(obstacle);
      this.obstacleCollidables.delete(obstacle);
      obstacle.teardown(game);
    });
  }
};
