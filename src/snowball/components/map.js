import { HexCoord } from '../../engine/utils/hex-coord.js';

const {
  BufferAttribute,
  InstancedBufferAttribute
} = self.THREE;

/**
 * Tile state reference:
 * - 0: Hidden
 * - 1: Visible
 * - 2: Glowing highlight
 * - 3: Shaking
 * - 4: Sinking
 * - 5: Raised
 */

export class Map {
  constructor(grid) {
    const tileCount = grid.width * grid.height;

    const tileStates = new InstancedBufferAttribute(
        new Float32Array(tileCount * 2), 2, 1);

    const tileOffsets = new InstancedBufferAttribute(
        new Float32Array(tileCount * 3), 3, 1);

    const tileObstacles = new InstancedBufferAttribute(
        new Float32Array(tileCount), 1, 1);

    const oddq = new HexCoord();
    const halfSize = new HexCoord(grid.width / 2.0, grid.height / 2.0, 0);
    const intermediateHexCoord = new HexCoord();

    oddq.set(grid.width, grid.height, 0.0);

    const maxMag = oddq.length() / 2.0;
    const erosionMag = maxMag * 0.65;

    const tileRings = [];

    for (let q = 0; q < grid.width; ++q) {
      for (let r = 0; r < grid.height; ++r) {
        oddq.set(q, r, 0);

        const mag = intermediateHexCoord.subVectors(oddq, halfSize).length();
        const magDelta = Math.abs(erosionMag - mag);

        const index = grid.oddqToIndex(oddq);
        const offset = grid.indexToOffset(index, oddq);

        // Decide the initial state of the tile (either hidden or shown):
        const erosionChance = 0.5 + magDelta / erosionMag;
        let state = mag > erosionMag
            ? Math.random() < erosionChance
                ? 0.0
                : 1.0
            : 1.0;

        // 15% chance to be a random tree for now:
        const obstacle = Math.random() > 0.85
            ? Math.floor(Math.random() * 4)
            : -1.0;

        if (state > 0.0) {
          // Build up an array of map "rings" for eroding tiles later:
          const ringIndex = Math.floor(mag);

          tileRings[ringIndex] = tileRings[ringIndex] || [];
          tileRings[ringIndex].push(index);
        }

        // Stash tile details into geometry attributes
        tileStates.setXY(index, state, 0.0);
        tileOffsets.setXYZ(index, offset.x, -offset.y, 0.0);
        tileObstacles.setX(index, obstacle);
      }
    }

    this.tileCount = tileCount;
    this.tileRings = tileRings;

    this.tileStates = tileStates;
    this.tileOffsets = tileOffsets;
    this.tileObstacles = tileObstacles;
    this.grid = grid;

    this.generateRaisedTiles();
  }

  generateRaisedTiles() {
    const grid = this.grid;
    const frontier = [];
    const visited = new Set();
    const maxIterations = Math.floor(this.tileCount / 64.0);

    for (let i = 0; i < maxIterations; ++i) {
      let index = -1;
      let state = -1;
      do {
        index = Math.floor(Math.random() * this.tileCount);
        state = this.getTileState(index);
      } while (state !== 1);

      let size = 0;

      frontier.push(index);

      while (frontier.length > 0 && size < 5.0) {
        const currentIndex = frontier.pop();

        const state = this.getTileState(currentIndex);
        const obstacle = this.getTileObstacle(currentIndex);

        if (Math.random() > 0.5 && !visited.has(currentIndex) &&
            obstacle === -1 && state === 1.0) {

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

  erode(numberOfTiles) {
    for (let i = 0; i < numberOfTiles; ++i) {
      const ring = this.tileRings[this.tileRings.length - 1];

      if (ring == null) {
        this.tileRings.pop();
        return;
      }

      const tileIndex = Math.floor(Math.random() * ring.length)
      const index = ring[tileIndex];

      if (index != null) {
        const state = this.getTileState(index);

        // TODO(cdata): Show some kind of "collapse" effect when the tile
        // goes from raised (5.0) to shaking (3.0)...
        if (state === 1.0 || state === 5.0) {
          this.setTileState(index, 3.0);
        } else if (state === 3.0) {
          ring.splice(tileIndex, 1);
          this.setTileState(index, 4.0);
        }
      }

      if (ring.length === 0) {
        this.tileRings.pop();
      }
    }
  }

  getRandomHabitableTileIndex() {
    console.log(this.tileRings.length);
    for (let i = 0; i < this.tileCount; ++i) {
      const maxRingIndex = Math.max(2.0, this.tileRings.length - 15);
      const ringIndex = Math.floor(Math.random() * maxRingIndex) + 10.0;
      const ring = this.tileRings[ringIndex];
      const tileIndex = Math.floor(Math.random() * ring.length);
      const index = ring[tileIndex];

      if (this.getTileState(index) === 1.0 &&
          this.getTileObstacle(index) === -1.0) {
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
