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

import {HexCoord} from '../../engine/utils/hex-coord.js';
import {SeedRandom} from '../utils/seed-random.js';

const treeTypes = 4;

const {BufferAttribute, InstancedBufferAttribute} = self.THREE;

/**
 * Tile state reference:
 * - 0: Hidden
 * - 1: Visible
 * - 2: Glowing highlight
 * - 3: Shaking
 * - 4: Sinking
 * - 5: Raised
 */

export class GameMap {
  constructor(grid, seed) {
    const seedRandom = this.seedRandom = new SeedRandom(seed);
    this.erodeSeedRandom = seedRandom.clone();
    this.erodeStep = 0;

    const tileCount = grid.width * grid.height;

    const tileStates = new InstancedBufferAttribute(new Float32Array(tileCount * 2), 2, false, 1);

    const tileOffsets = new InstancedBufferAttribute(new Float32Array(tileCount * 3), 3, false, 1);

    const tileObstacles = new InstancedBufferAttribute(new Float32Array(tileCount), 1, false, 1);

    const oddq = new HexCoord();
    const halfSize = new HexCoord(grid.width / 2.0, grid.height / 2.0, 0);
    const intermediateHexCoord = new HexCoord();

    oddq.set(grid.width, grid.height, 0.0);

    const maxMag = oddq.length() / 2.0;
    const erosionMag = maxMag * 0.65;

    const tileRings = [];

    let passableTileCount = 0;

    for (let q = 0; q < grid.width; ++q) {
      for (let r = 0; r < grid.height; ++r) {
        oddq.set(q, r, 0);

        const mag = intermediateHexCoord.subVectors(oddq, halfSize).length();
        const magDelta = Math.abs(erosionMag - mag);

        const index = grid.oddqToIndex(oddq);
        const offset = grid.indexToOffset(index, oddq);

        // Decide the initial state of the tile (either hidden or shown):
        const erosionChance = 0.5 + magDelta / erosionMag;
        const state = mag > erosionMag ? seedRandom.random() < erosionChance ? 0.0 : 1.0 : 1.0;

        // 15% chance to be a random tree for now:
        const obstacle = seedRandom.random() > 0.85 ? seedRandom.randRange(treeTypes) : -1.0;

        if (state > 0.0) {
          // Build up an array of map "rings" for eroding tiles later:
          const ringIndex = Math.floor(mag);

          tileRings[ringIndex] = tileRings[ringIndex] || [];
          tileRings[ringIndex].push(index);
        }

        if (state === 1.0) {
          passableTileCount++;
        }

        // Stash tile details into geometry attributes
        tileStates.setXY(index, state, 0.0);
        tileOffsets.setXYZ(index, offset.x, -offset.y, 0.0);
        tileObstacles.setX(index, obstacle);
      }
    }

    this.passableTileCount = passableTileCount;
    this.tileCount = tileCount;
    this.tileRings = tileRings;

    this.tileStates = tileStates;
    this.tileOffsets = tileOffsets;
    this.tileObstacles = tileObstacles;
    this.grid = grid;

    this._generateRaisedTiles(seedRandom);
  }

  _generateRaisedTiles(seedRandom) {
    const grid = this.grid;
    const frontier = [];
    const visited = new Set();
    const maxIterations = Math.floor(this.tileCount / 64.0);

    for (let i = 0; i < maxIterations; ++i) {
      let index = -1;
      let state = -1;
      let attempts = 10;
      do {
        index = seedRandom.randRange(this.tileCount);
        state = this.getTileState(index);
        if (!--attempts) {
          return;
        }
      } while (state !== 1);

      let size = 0;

      frontier.push(index);

      while (frontier.length > 0 && size < 5.0) {
        const currentIndex = frontier.pop();

        const state = this.getTileState(currentIndex);
        const obstacle = this.getTileObstacle(currentIndex);

        if (seedRandom.random() > 0.5 && !visited.has(currentIndex) && obstacle === -1 &&
            state === 1.0) {
          this.setTileState(currentIndex, 5.0);
          visited.add(currentIndex);
          size++;

          const neighborIndices = grid.indexToNeighborIndices(currentIndex);

          for (let i = 0; i < neighborIndices.length; i++) {
            const neighborIndex = neighborIndices[i];
            frontier.push(neighborIndex);
          }
        }
      }

      frontier.splice(0, frontier.length - 1);
    }
  }

  erode() {
    const maxErodedTiles = Math.ceil(this.tileRings.length / 5) * 3.0;
    const numberOfTiles = this.erodeSeedRandom.randRange(maxErodedTiles);

    for (let i = 0; i < numberOfTiles; ++i) {
      const ring = this.tileRings[this.tileRings.length - 1];

      if (ring == null) {
        this.tileRings.pop();
        continue;
      }

      const ringIndex = this.erodeSeedRandom.randRange(ring.length);
      const index = ring[ringIndex];
      const state = this.getTileState(index);

      if (state === 1.0) {
        this.passableTileCount--;
      }

      // TODO(cdata): Show some kind of "collapse" effect when the tile
      // goes from raised (5.0) to shaking (3.0)...
      if (state === 1.0 || state === 5.0) {
        this.setTileState(index, 3.0);
      } else if (state === 3.0) {
        ring.splice(ringIndex, 1);
        this.setTileState(index, 4.0);
      }

      if (!ring.length) {
        this.tileRings.pop();
      }
    }
  }

  getRandomNearbyPassableTileIndex(index, maxRadius, random = this.seedRandom) {
    const radius = Math.floor(Math.random() * (maxRadius - 1)) + 1;
    const ring = this.grid.indexToRingIndices(index, radius);

    while (ring.length) {
      const ringIndex = Math.floor(Math.random() * ring.length);
      const tileIndex = ring[ringIndex];

      const tileState = this.getTileState(tileIndex);

      if (this.getTileState(index) === 1.0 && this.getTileObstacle(index) === -1.0) {
        return tileIndex;
      }

      ring.splice(ringIndex, 1);
    }

    return index;
  }

  getRandomHabitableTileIndex(random = this.seedRandom) {
    for (let i = 0; i < this.tileCount; ++i) {
      if (this.tileRings.length === 0) {
        break;
      }

      const minRingIndex = Math.floor(this.tileRings.length / 4);
      const maxRingIndex = Math.max(2.0, this.tileRings.length - 10);
      const ringIndex = random.randRange(minRingIndex, maxRingIndex);

      const ring = this.tileRings[ringIndex];
      const tileIndex = random.randRange(ring.length);
      const index = ring[tileIndex];

      if (this.getTileState(index) === 1.0 && this.getTileObstacle(index) === -1.0) {
        return index;
      }
    }

    console.warn('No habitable tile index found!');
  }

  setTileObstacle(index, sprite) {
    const tileObstacles = this.tileObstacles;

    tileObstacles.setX(index, sprite);
    tileObstacles.needsUpdate = true;
  }

  getTileObstacle(index) {
    return this.tileObstacles.getX(index);
  }

  setTileState(index, state) {
    const tileStates = this.tileStates;

    tileStates.setXY(index, state, performance.now());
    tileStates.needsUpdate = true;
  }

  getTileState(index) {
    return this.tileStates.getX(index);
  }
};
