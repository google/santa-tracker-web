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

import { HexCoord } from './hex-coord.js';
import { PriorityQueue } from '../../third_party/priorityqueue.js';

const intermediateHexCoord = new HexCoord();
const intermediateNeighbors = [
  new HexCoord(), new HexCoord(), new HexCoord(),
  new HexCoord(), new HexCoord(), new HexCoord()
];
const cubicNeighborhood = [
  new HexCoord(1, -1, 0), new HexCoord(1, 0, -1), new HexCoord(0, 1, -1),
  new HexCoord(-1, 1, 0), new HexCoord(-1, 0, 1), new HexCoord(0, -1, 1)
];

const SQRT_THREE = Math.sqrt(3);

const defaultHeuristic = (() => {
  const toOddq = new HexCoord();
  const currentOddq = new HexCoord();

  return (grid, toIndex, currentIndex) =>
      grid.indexToOddq(toIndex, toOddq)
          .distanceTo(grid.indexToOddq(currentIndex, currentOddq));
})();

const defaultPassable = (grid, currentIndex) => true;

export class HexGrid {
  static get SQRT_THREE() {
    return SQRT_THREE;
  }

  static get defaultHeuristic() {
    return defaultHeuristic;
  }

  static get defaultPassable() {
    return defaultPassable;
  }

  static get intermediateHexCoord() {
    return intermediateHexCoord;
  }

  static get intermediateNeighbors() {
    return intermediateNeighbors;
  }

  static get cubicNeighborhood() {
    return cubicNeighborhood;
  }

  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;

    this.cellHeight = HexGrid.SQRT_THREE / 2 * cellSize;
    this.pixelWidth = this.width * this.cellSize * 0.75 +
        0.25 * this.cellSize;
    this.pixelHeight = this.height * this.cellHeight + this.cellHeight * 0.5;
  }

  // UV conversions
  uvToPixel(uv, pixel = new HexCoord()) {
    const { x, y } = uv;

    pixel.x = (x - 0.5 / this.width) * this.pixelWidth;
    pixel.y = ((1.0 - y) - 0.5 / this.height) * this.pixelHeight;

    return pixel;
  }

  uvToIndex(uv) {
    return this.pixelToIndex(this.uvToPixel(uv, HexGrid.intermediateHexCoord));
  }

  // Pixel conversions
  pixelToIndex(pixel) {
    return this.oddqToIndex(this.pixelToOddq(pixel, intermediateHexCoord));
  }

  pixelToOddq(pixel, oddq = new HexCoord()) {
    const size = this.cellSize / 2.0;
    const { x, y } = pixel;

    const q = x * 2/3 / size;
    const r = (-x / 3 + SQRT_THREE / 3 * y) / size;
    const s = 0;

    oddq.set(q, r, s);

    return this.roundOddq(oddq);
  }

  pixelToAxial(pixel, axial = new HexCoord()) {
    const size = this.cellSize / 2.0;
    const { x, y } = pixel;

    axial.q = x * 2/3 / size;
    axial.r = (-x / 3 + SQRT_THREE / 3 * y) / size;
    axial.s = 0;

    return this.roundAxial(axial);
  }

  // Index conversions
  indexToCube(index, cube = new HexCoord()) {
    const oddq = this.indexToOddq(index, intermediateHexCoord);
    return this.oddqToCube(oddq, cube);
  }

  indexToOddq(index, oddq = new HexCoord()) {
    oddq.x = Math.floor(index / this.height);
    oddq.y = index % this.height;
    oddq.z = 0;

    return oddq;
  }

  indexToRingIndices(index, radius) {
    return this.cubeToRingIndices(
        this.indexToCube(index, intermediateHexCoord), radius);
  }

  indexToNeighborIndices(index) {
    return this.cubeToNeighborIndices(
        this.indexToCube(index, intermediateHexCoord));
  }

  indexToPixel(index, pixel = new HexCoord()) {
    const offset = this.indexToOffset(index, pixel);
    pixel.multiplyScalar(this.cellSize);
    return pixel;
  }

  indexToOffset(index, offset = new HexCoord()) {
    return this.cubeToOffset(this.indexToCube(index, offset), offset);
  }

  indexToPosition(index, position = new HexCoord()) {
    const pixel = this.indexToPixel(index, HexGrid.intermediateHexCoord);
    const x = pixel.x - this.pixelWidth / 2;
    const y = -pixel.y + this.pixelHeight / 2;

    position.set(x, y, 0);

    return position;
  }

  // Cube conversions
  cubeToIndex(cube) {
    return this.oddqToIndex(this.cubeToOddq(cube, intermediateHexCoord));
  }

  cubeToOddq(cube, oddq = new HexCoord()) {
    const { x, y, z } = cube;

    oddq.q = x;
    oddq.r = z + (x - (x&1)) / 2;
    oddq.s = 0;

    return oddq;
  }

  cubeToAxial(cube, axial = new HexCoord()) {
    const { x, z } = cube;

    axial.q = x;
    axial.r = z;
    axial.s = 0;

    return axial;
  }

  cubeToRingIndices(cube, radius) {
    if (radius === 0) {
      return [this.cubeToIndex(cube)];
    }

    const ring = [];
    const cursor = cubicNeighborhood[4]
        .clone()
        .multiplyScalar(radius)
        .add(cube);

    for (let i = 0; i < 6; ++i) {
      for (let j = 0; j < radius; ++j) {
        ring.push(this.cubeToIndex(cursor));
        cursor.add(cubicNeighborhood[i]);
      }
    }

    return ring;
  }

  cubeToNeighborCubes(cube, neighbors = []) {
    for (let i = 0; i < cubicNeighborhood.length; ++i) {
      neighbors[i] = neighbors[i] || new HexCoord();
      neighbors[i].addVectors(cube, cubicNeighborhood[i]);
    }

    return neighbors;
  }

  cubeToNeighborIndices(cube) {
    return this.cubeToNeighborCubes(cube, intermediateNeighbors).map(
        cube => this.cubeToIndex(cube));
  }

  cubeToOffset(cube, offset = new HexCoord()) {
    const scaleX = 0.5;
    const scaleY = 0.5;
    const { x, z } = cube;

    offset.x = 0.5 + 1.5 * x * scaleX;
    offset.y = 0.5 + (HexGrid.SQRT_THREE / 2 * x + HexGrid.SQRT_THREE * z) * scaleY;
    offset.z = 0;

    return offset;
  }

  // Odd-Q conversions
  oddqToIndex(oddq) {
    const { q, r } = oddq;

    if (q > -1 && q < this.width && r > -1 && r < this.height) {
      return q * this.height + r;
    }

    return -1;
  }

  oddqToCube(oddq, cube = new HexCoord()) {
    const { q, r } = oddq;

    cube.x = q;
    cube.z = r - (q - (q&1)) / 2;
    cube.y = -cube.x - cube.z;

    return cube;
  }

  // Axial conversions
  axialToCube(axial, cube = new HexCoord()) {
    const { q, r } = axial;

    cube.x = q;
    cube.z = r;
    cube.y = -cube.x - cube.z;

    return cube;
  }

  // Offset conversions
  offsetToPosition(offset, position = new Vector3()) {
    const x = offset.x * this.cellSize * 0.75 + 0.25 * this.cellSize -
        this.pixelWidth / 2;
    const y = -1 * offset.y * this.cellSize * 0.75 - 0.5 * this.cellSize +
        this.pixelHeight / 2;

    position.x = x;
    position.y = y;
    position.z = y;

    return position;
  }

  // Position conversions
  positionToIndex(position) {
    const x = (position.x + this.pixelWidth / 2) / this.pixelWidth;
    const y = (position.y + this.pixelHeight / 2) / this.pixelHeight;
    const hexCoord = HexGrid.intermediateHexCoord;

    hexCoord.x = x;
    hexCoord.y = y;
    hexCoord.z = 0;

    return this.uvToIndex(hexCoord);
  }

  // Rounding...
  roundCube(cube) {
    const rX = Math.round(cube.x);
    const rY = Math.round(cube.y);
    const rZ = Math.round(cube.z);

    const dX = Math.abs(rX - cube.x);
    const dY = Math.abs(rY - cube.y);
    const dZ = Math.abs(rZ - cube.z);

    cube.x = rX;
    cube.y = rY;
    cube.z = rZ;

    if (dX > dY && dX > dZ) {
      cube.x = -rY - rZ;
    } else if (dY > dZ) {
      cube.y = -rX - rZ;
    } else {
      cube.z = -rX - rY;
    }

    return cube;
  }

  roundAxial(axial) {
    const cube = this.axialToCube(axial, intermediateHexCoord);
    const roundedCube = this.roundCube(cube);

    return this.cubeToAxial(roundedCube, axial);
  }

  roundOddq(oddq) {
    intermediateHexCoord.set(oddq.q, -oddq.q - oddq.r, oddq.r);

    const roundedCube = this.roundCube(intermediateHexCoord);

    return this.cubeToOddq(roundedCube, oddq);
  }

  waypoints(fromIndex, toIndex, passable = defaultPassable,
      heuristic = defaultHeuristic) {
    const path = this.path(fromIndex, toIndex, passable, heuristic);
    const cubes = path.map(index => this.indexToCube(index));

    const waypoints = [];
    const lastDelta = new HexCoord();
    const nextDelta = new HexCoord();

    lastDelta.set(0, 0, 0);

    for (let i = 0; i < path.length; ++i) {
      const cube = cubes[i];
      const nextCube = cubes[i + 1];
      const nextNexCube = cubes[i + 2];

      if (nextCube != null) {
        nextDelta.subVectors(nextCube, cube);
      }

      if (nextCube == null || !lastDelta.equals(nextDelta)) {
        lastDelta.copy(nextDelta);
        waypoints.push(this.cubeToIndex(cube));
      }
    }

    return waypoints;
  }

  path(fromIndex, toIndex, passable = defaultPassable,
      heuristic = defaultHeuristic) {
    const frontier = new PriorityQueue((a, b) => b.cost - a.cost);
    const path = [];

    // Short circuit if the target tile is not passable
    if (!passable(this, toIndex)) {
      return path;
    }

    const cost = new Map();
    const directions = new Map();

    cost.set(fromIndex, 0);
    frontier.enq({ cost: 0, index: fromIndex });

    while (frontier.size() > 0) {
      const currentIndex = frontier.deq().index;

      if (currentIndex === toIndex) {
        let index = toIndex;
        do {
          path.unshift(index);
          index = directions.get(index);
        } while (directions.size > 0 && index !== fromIndex);

        path.unshift(fromIndex);

        break;
      }

      const neighborIndices = this.indexToNeighborIndices(currentIndex);

      for (let i = 0; i < neighborIndices.length; ++i) {
        const neighborIndex = neighborIndices[i];

        if (neighborIndex < 0 || neighborIndex == null ||
            !passable(this, neighborIndex)) {
          continue;
        }

        const neighborCost = heuristic(this, toIndex, neighborIndex);
        const previousTotalCost = cost.get(neighborIndex);
        const newTotalCost = cost.get(fromIndex) + neighborCost;

        if (previousTotalCost == null || newTotalCost < previousTotalCost) {
          cost.set(neighborIndex, newTotalCost);
          frontier.enq({ cost: newTotalCost, index: neighborIndex });
          directions.set(neighborIndex, currentIndex);
        }
      }
    }

    return path;
  }
}
