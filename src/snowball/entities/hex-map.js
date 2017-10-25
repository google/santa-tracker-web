import { Entity } from '../../engine/core/entity.js';
import { combine } from '../../engine/utils/function.js';
import { HexCoord } from '../../engine/utils/hex-coord.js';
import { PriorityQueue } from '../../third_party/priorityqueue.js';

const {
  Vector2,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  BufferAttribute,
  TextureLoader,
  RawShaderMaterial,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  DoubleSide
} = self.THREE;

const textureLoader = new TextureLoader();

const vertexShader = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float tileScale;
uniform vec2 size;
uniform float time;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 tileOffset;
attribute float tileState;
attribute float tileSprite;

varying vec2 vUv;
varying float vTileState;
varying float vShouldHighlight;

void main() {
  mat4 scaleMatrix = mat4(mat3(tileScale));
  vec3 positionOffset = vec3(
      tileOffset.x - size.x / 2.0 * 0.75 - 0.125,
      tileOffset.y * -1.0 + (size.y / 2.0 * 0.75) + 1.0,
      tileOffset.z * -1.0);
  vec4 scaledPosition = scaleMatrix * vec4(positionOffset + (position * 2.0), 1.0);

  vec2 uvOffset = vec2(mod(tileSprite, 4.0), (3.0 - floor(tileSprite / 4.0))) / 4.0;
  vUv = uvOffset + uv / 4.0;

  vTileState = tileState;
  vShouldHighlight = step(2.0, tileState) * step(tileState, 3.0);

  float shakeTime = step(3.0, tileState);

  if (tileState > 3.0) {
    float elapsed = (time - tileState) / 1000.0;
    float e3 = elapsed * elapsed * elapsed;

    float xOffset = sin((elapsed * 15.0)) *
        cos(elapsed * 25.0) *
        (3.0 + 3.0 * e3 - 5.0 * elapsed);

    float yOffset = max(e3 - 0.25, 0.0) * 15.0;

    if (elapsed <= 1.75) {
      scaledPosition.x += xOffset;
      scaledPosition.y -= yOffset;
    }
  }

  gl_Position = projectionMatrix * modelViewMatrix * scaledPosition;
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D map;
uniform float scale;
uniform float time;

varying vec2 vUv;
varying float vTileState;
varying float vShouldHighlight;

void main() {
  vec4 color = texture2D(map, vUv);
  float alpha = smoothstep(0.75, 0.8, color.a);

  float aScale = 1.0;

  float toneScale = 0.15 + abs(sin(time / 300.0)) * 0.15;
  float rScale = 0.45 * toneScale;
  float gScale = 0.75 * toneScale;

  vec3 colorTone = vec3(
      1.0 - vShouldHighlight * rScale,
      1.0 - vShouldHighlight * gScale,
      1.0);

  if (vTileState >= 3.0) {
    float elapsed = (time - vTileState) / 1000.0;
    float e3 = elapsed * elapsed * elapsed;
    aScale = min(1.35 - e3, 1.0);
  }

  if (alpha < 0.001 || vTileState < 1.0 || aScale < 0.0) {
    discard;
  }

  gl_FragColor = vec4(colorTone * color.rgb, color.a * aScale);
}
`;

const SQRT_THREE = Math.sqrt(3);

const intermediateHexCoord = new HexCoord();
const intermediateNeighbors = [
  new HexCoord(), new HexCoord(), new HexCoord(),
  new HexCoord(), new HexCoord(), new HexCoord()
];

const cubicNeighborhood = [
  new HexCoord(1, -1, 0), new HexCoord(1, 0, -1), new HexCoord(0, 1, -1),
  new HexCoord(-1, 1, 0), new HexCoord(-1, 0, 1), new HexCoord(0, -1, 1)
];

export class HexMap extends Entity(Mesh) {
  constructor(unitWidth = 32, unitHeight = 32, tileScale = 32) {
    const geometry = new InstancedBufferGeometry();
    const texture = textureLoader.load('/src/images/tiles.png');
    const uniforms = {
      // Will be updated with the time every game tick
      time: {
        value: performance.now()
      },
      // The texture containing the game tiles
      map: {
        value: texture
      },
      // The scale of the tiles configured via constructor
      tileScale: {
        value: tileScale
      },
      // The width and height in pixels of the game map
      size: {
        value: new Vector2(unitWidth, unitHeight)
      }
    };

    // Construct the Mesh
    super(geometry, new RawShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      transparent: true
    }));

    this.unitWidth = unitWidth;
    this.unitHeight = unitHeight;
    this.tileScale = tileScale;
    this.tileCount = unitWidth * unitHeight;

    // TODO(cdata): Make sure this is the correct calculation for
    // pixel width / height:
    this.width = this.unitWidth * tileScale * 0.75 + 0.25 * tileScale;
    this.height = this.unitHeight * tileScale * 0.75 + 0.5 * tileScale;

    console.log(this.width, this.height);

    this.frustumCulled = false;
    this.uniforms = uniforms;

    // This mesh is used for intersection testing. We need this because the
    // bounding box of the instanced buffer geometry is the size of one tile.
    // There is probably a better way to make this work, but this way works
    // for now:
    this.surface = new Mesh(
        new PlaneBufferGeometry(this.width, this.height),
        new MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          wireframe: false
        }));

    this.surface.rotation.x = Math.PI;
    this.surface.position.y += tileScale / 4.0;
    this.add(this.surface);
    this.tileRings = [];

    this.initializeGeometry();

    window.m = this;
    window.s = this.attributes.tileState;
  }

  initializeGeometry() {
    const tileCount = this.unitWidth * this.unitHeight;

    // The vertices, uvs and indices for a single hex tile.
    // These will be instanced tileCount times:
    const positions = new BufferAttribute(new Float32Array([
      -0.5, 0.5,  0,
       0.5, 0.5,  0,
      -0.5, -0.5, 0,
       0.5, -0.5, 0
    ]), 3);

    this.geometry.addAttribute('position', positions);

    const uvs = new BufferAttribute(new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ]), 2);

    this.geometry.addAttribute('uv', uvs);

    const indices = new BufferAttribute(new Uint16Array([
      0, 1, 2,
      2, 1, 3
    ]), 1);

    this.geometry.setIndex(indices);

    // Contains the relative positions of the instanced tiles:
    const tileOffsets = new InstancedBufferAttribute(
        new Float32Array(tileCount * 3), 3, 1);

    // Contains the state of each instanced tile.
    // 0: hidden
    // 1: visible
    // 2: highlight
    // 3+: sunk; the value is the game time when the tile began to sink
    const tileStates = new InstancedBufferAttribute(
        new Float32Array(tileCount), 1, 1).setDynamic(true);

    // The sprite used when rendering the tile. Supports values 0 - 15.
    const tileSprites = new InstancedBufferAttribute(
        new Float32Array(tileCount), 1, 1);

    // Conventionally: q = column, r = row. Hex grid uses odd-q layout.
    // @see http://www.redblobgames.com/grids/hexagons/#coordinates
    const oddq = new HexCoord();
    const halfSize = new HexCoord(this.unitWidth / 2.0, this.unitHeight / 2.0, 0);

    oddq.set(this.unitWidth, this.unitHeight, 0.0);

    const maxMag = oddq.length() / 2.0;
    const erosionMag = maxMag * 0.65;

    for (let q = 0; q < this.unitWidth; ++q) {
      for (let r = 0; r < this.unitHeight; ++r) {
        oddq.set(q, r, 0);

        const mag = intermediateHexCoord.subVectors(oddq, halfSize).length();
        const magDelta = Math.abs(erosionMag - mag);

        const index = this.oddqToIndex(oddq);
        const offset = this.indexToOffset(index, oddq);

        // Decide the initial state of the tile (either hidden or shown):
        const erosionChance = 0.5 + magDelta / erosionMag;
        const state = mag > erosionMag
            ? Math.random() < erosionChance
                ? 0.0
                : 1.0
            : 1.0;

        // Decide the initial sprite for the tile, just randomness:
        const tile = Math.abs(Math.floor(
            12 + 4 * Math.random() - Math.random() * Math.random() * 16) % 16);

        if (state > 0.0) {
          // Build up an array of map "rings" for eroding tiles later:
          const ringIndex = Math.floor(mag);

          this.tileRings[ringIndex] = this.tileRings[ringIndex] || [];
          this.tileRings[ringIndex].push(index);
        }

        // Stash tile details into geometry attributes
        tileStates.setX(index, state);
        tileOffsets.setXYZ(index, offset.x, offset.y, offset.y / 10.0);
        tileSprites.setX(index, tile);
      }
    }

    this.geometry.addAttribute('tileOffset', tileOffsets);
    this.geometry.addAttribute('tileState', tileStates);
    this.geometry.addAttribute('tileSprite', tileSprites);
  }

  erode(numberOfTiles) {
    for (let i = 0; i < numberOfTiles; ++i) {
      const ring = this.tileRings[this.tileRings.length - 1];

      if (ring == null) {
        return;
      }

      const tileIndex = Math.floor(Math.random() * ring.length)
      const index = ring[tileIndex];

      if (index != null) {
        ring.splice(tileIndex, 1);
        this.setTileState(index, performance.now());
      }

      if (ring.length === 0) {
        this.tileRings.pop();
      }
    }
  }

  path(fromIndex, toIndex,
      passable = currentIndex => true,
      heuristic = (toIndex, currentIndex) => 0) {
    const frontier = new PriorityQueue((a, b) => b.cost - a.cost);
    const path = [];

    //const currentCube = this.indexToCube(fromIndex);
    //const toCube = this.indexToCube(toIndex);

    // Short circuit if the target tile is not passable
    if (!passable(toIndex)) {
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
        } while (index !== fromIndex);

        path.unshift(fromIndex);

        break;
      }

      const neighborIndices = this.indexToNeighborIndices(currentIndex);
      //const currentCube = this.indexToCube(currentIndex);
      //const neighborCubes = this.cubeToNeighborCubes(
          //currentCube, intermediateNeighbors);

      for (let i = 0; i < neighborIndices.length; ++i) {
        //const neighborCube = neighborCubes[i];
        //const neighborIndex = this.cubeToIndex(neighborCube);
        const neighborIndex = neighborIndices[i];

        if (!passable(neighborIndex)) {
          continue;
        }

        const neighborCost = heuristic(toIndex, neighborIndex);
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

  // Helpers for accessing state / tile values
  get attributes() {
    return this.geometry.attributes;
  }

  setTileSprite(index, sprite) {
    const tileSprites = this.attributes.tileSprite;

    tileSprites.setX(index, sprite);
    tileSprites.needsUpdate = true;
  }

  getTileSprite(index) {
    return this.attributes.tileSprite.getX(index);
  }

  setTileState(index, state) {
    const tileStates = this.attributes.tileState;

    tileStates.setX(index, state);
    tileStates.needsUpdate = true;
  }

  getTileState(index) {
    return this.attributes.tileState.getX(index);
  }

  // UV conversions
  uvToPixel(uv, pixel = new HexCoord()) {
    const { x, y } = uv;

    pixel.x = (x * 0.999 - 0.5 / this.unitWidth)
        * this.width;

    pixel.y = (y * 1.155 - 0.5 / this.unitHeight)
        * this.height;

    return pixel;
  }

  uvToIndex(uv) {
    return this.pixelToIndex(this.uvToPixel(uv, intermediateHexCoord));
  }


  // Pixel conversions
  pixelToIndex(pixel) {
    return this.oddqToIndex(this.pixelToOddq(pixel, intermediateHexCoord));
  }

  pixelToOddq(pixel, oddq = new HexCoord()) {
    const size = this.tileScale / 2.0;
    const { x, y } = pixel;

    const q = x * 2/3 / size;
    const r = (-x / 3 + SQRT_THREE / 3 * y) / size;
    const s = 0;

    oddq.set(q, r, s);

    return this.roundOddq(oddq);
  }

  pixelToAxial(pixel, axial = new HexCoord()) {
    const size = this.tileScale / 2.0;
    const { x, y } = pixel;

    axial.q = x * 2/3 / size;
    axial.r = (-x / 3 + SQRT_THREE / 3 * y) / size;
    axial.s = 0;

    return this.roundAxial(axial);
  }


  // Index conversions
  indexToOffset(index, offset = new HexCoord()) {
    return this.cubeToOffset(this.indexToCube(index, offset), offset);
  }

  indexToCube(index, cube = new HexCoord()) {
    const oddq = this.indexToOddq(index, intermediateHexCoord);
    return this.oddqToCube(oddq, cube);
  }

  indexToOddq(index, oddq = new HexCoord()) {
    oddq.x = Math.floor(index / this.unitHeight);
    oddq.y = index % this.unitHeight;
    oddq.z = 0;

    return oddq;
  }

  indexToPixel(index, pixel = new HexCoord()) {
    const offset = this.indexToOffset(index, pixel);
    pixel.multiplyScalar(this.tileScale);
    return pixel;
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

  cubeToOffset(cube, offset = new HexCoord()) {
    const scaleX = 0.5;
    const scaleY = 0.4325; // Warning: here be magic
    const { x, z } = cube;

    offset.x = 0.5 + 1.5 * x * scaleX;
    offset.y = 0.5 + (SQRT_THREE / 2 * x + SQRT_THREE * z) * scaleY;
    offset.z = 0;

    return offset;
  }

  cubeToAxial(cube, axial = new HexCoord()) {
    const { x, z } = cube;

    axial.q = x;
    axial.r = z;
    axial.s = 0;

    return axial;
  }

  indexToNeighborIndices(index) {
    return this.cubeToNeighborIndices(
        this.indexToCube(index, intermediateHexCoord));
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


  // Odd-Q conversions
  oddqToIndex(oddq) {
    const { q, r } = oddq;

    if (q > -1 && q < this.unitWidth && r > -1 && r < this.unitHeight) {
      return q * this.unitHeight + r;
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

  hitEventToIndex(event) {
    const hit = event.detail.hits.get(this.surface)[0];
    const uv = hit.uv;
    return this.uvToIndex(uv);
  }

  setup(game) {
    const { inputSystem } = game;

    this.unsubscribe = combine(
        inputSystem.on('pick', event => this.onPick(event), this.surface),
        inputSystem.on('move', event => this.onMove(event), this.surface));
  }

  update(game) {
    const time = performance.now();
    this.uniforms.time.value = time;
  }

  teardown(game) {
    this.unsubscribe();
  }

  onMove(event) {
    const state = this.attributes.tileState;
    const index = this.hitEventToIndex(event);

    if (this.lastHighlightIndex != null && state.getX(this.lastHighlightIndex) < 3) {
      state.setX(this.lastHighlightIndex, 1);
      state.needsUpdate = true;
    }

    if (index < 0) {
      return;
    }

    if (state.getX(index) === 1) {
      this.lastHighlightIndex = index;
      state.setX(index, 2);
      state.needsUpdate = true;
    }
  }

  onPick(event) {
    const state = this.attributes.state;
    const index = this.hitEventToIndex(event);

    if (this.lastPickIndex == null) {
      this.lastPickIndex = index;
    } else if (index !== this.lastPickIndex) {
      const start = performance.now();
      const path = this.path(this.lastPickIndex, index,
          currentIndex =>
              this.getTileState(currentIndex) > 0 &&
              this.getTileSprite(currentIndex) !== 0,
          (() => {
            const toOddq = new HexCoord();
            const currentOddq = new HexCoord();

            return (toIndex, currentIndex) =>
                this.indexToOddq(toIndex, toOddq)
                    .distanceTo(this.indexToOddq(currentIndex, currentOddq));
          })());
      const end = performance.now();

      path.forEach(index => {
        this.setTileState(index, 2.0);
      });

      console.log(`Path found from ${this.lastPickIndex} to ${index} in ${end - start}ms:`, path);
      this.lastPickIndex = null;
    }
  }
};
