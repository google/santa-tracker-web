import { Entity } from '../../engine/core/entity.js';
import { HexGrid } from '../../engine/utils/hex-grid.js';
import { combine } from '../../engine/utils/function.js';

const {
  Vector3,
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

const vert = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float scale;
uniform vec2 size;
uniform float time;

attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute float state;

varying vec2 vUv;
varying float vState;
varying float vShouldHighlight;

void main() {
  mat4 scaleMatrix = mat4(mat3(scale));
  vec4 scaledPosition = scaleMatrix * vec4(offset + position, 1.0);

  vUv = uv;
  vState = state;

  vShouldHighlight = step(2.0, vState) * step(vState, 3.0);

  float shakeTime = step(3.0, vState);

  if (state > 3.0) {
    float elapsed = (time - state) / 1000.0;
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

const frag = `
precision highp float;

uniform sampler2D map;
uniform float scale;
uniform vec2 highlight;
uniform float time;

varying vec2 vUv;
varying float vState;
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

  if (vState >= 3.0) {
    float elapsed = (time - vState) / 1000.0;
    float e3 = elapsed * elapsed * elapsed;
    aScale = min(1.35 - e3, 1.0);
  }

  if (alpha < 0.01 || vState < 1.0 || aScale < 0.0) {
    discard;
  }

  gl_FragColor = vec4(colorTone * color.rgb, color.a * aScale);
}
`;

export class FastMap extends Entity(Mesh) {
  constructor(width = 32, height = 32, scale = 32) {

    const geometry = new InstancedBufferGeometry();
    const positions = new Float32Array(width * height * 3);
    const cell = new Vector3();
    const hexCount = width * height;

    const vertices = new BufferAttribute(new Float32Array([
      -0.5, 0.5,  0,
       0.5, 0.5,  0,
      -0.5, -0.5, 0,
       0.5, -0.5, 0
    ]), 3);

    geometry.addAttribute('position', vertices);

    const uvs = new BufferAttribute(new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ]), 2);

    geometry.addAttribute('uv', uvs);

    const indices = new BufferAttribute(new Uint16Array([
      0, 1, 2,
      2, 1, 3
    ]), 1);

    geometry.setIndex(indices);

    const offsets = new InstancedBufferAttribute(
        new Float32Array(hexCount * 3), 3, 1);
    /**
     * 0 - hidden
     * 1 - visible
     * 2 - highlight
     * 3 - sunk
     */
    const state = new InstancedBufferAttribute(
        new Float32Array(hexCount), 1, 1).setDynamic(true);

    const rings = [];

    for (let q = 0; q < width; ++q) {
      for (let r = 0; r < height; ++r) {
        const x = q;
        const y = (-q - r);
        const z = r;
        const i = q * width + r;


        cell.set(x, y, z);
        HexGrid.toPixel(cell);

        const width2 = width / 2;
        const height2 = height / 2;
        const q2 = (q - width2);
        const r2 = (r - height2);
        const mag = Math.sqrt(q2 * q2 + r2 * r2);

        if (mag < width2 && mag < height2) {
          const value = mag > width2 / 2.5 ?
              Math.random() * (width2 - mag) < width2 / 6 ? 0 : 1 : 1;

          if (value === 1) {
            const ringIndex = Math.floor(mag);

            rings[ringIndex] = rings[ringIndex] || [];
            rings[ringIndex].push(i)
          }

          state.setX(i, value);
        }

        offsets.setXYZ(i, cell.x, cell.y, cell.y / 10.0);
      }
    }

    geometry.addAttribute('offset', offsets);
    geometry.addAttribute('state', state);

    const texture = new TextureLoader().load('/subg-terrain/hex_land.png');
    const uniforms = {
      time: {
        value: performance.now()
      },
      map: {
        value: texture
      },
      scale: {
        value: scale
      },
      highlight: {
        value: new Vector2()
      },
      size: {
        value: new Vector2()
      }
    };

    const material = new RawShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      side: DoubleSide,
      transparent: true
    });

    super(geometry, material);

    this.frustumCulled = false;
    this.uniforms = uniforms;

    this.unitWidth = width;
    this.unitHeight = height;

    this.width = this.unitWidth * scale * 0.75;
    this.height = this.unitHeight * scale * 0.75 - scale;

    uniforms.size.value.set(this.width, this.height);
    console.log(uniforms);

    this.hexGrid = new HexGrid(this.width, this.height);

    this.position.set(this.width / -2, this.height / 2, 0);

    this.surface = new THREE.Mesh(
        new PlaneBufferGeometry(this.width, this.height),
        new MeshBasicMaterial({ color: 0x000000, transparent: true, wireframe: true }));

    this.rings = rings;
    this.surface.rotation.x = Math.PI;
    this.surface.position.set(this.width / 2, -this.height / 2, 0);
    this.add(this.surface);
  }

  setup(game) {
    const { inputSystem } = game;

    this.unsubscribe = combine(
        inputSystem.on('pick', event => this.onPick(event), this.surface),
        inputSystem.on('move', event => this.onMove(event), this.surface));
  }

  onPick(event) {
    const hit = event.detail.hits.get(this.surface)[0];
    const state = this.geometry.attributes.state;
    const index = this.uvToTileIndex(hit.uv);

    console.log('Pick!', index);

    if (state.getX(index) < 3) {
      state.setX(index, performance.now());
      state.needsUpdate = true;
    }
  }

  onMove(event) {
    const hit = event.detail.hits.get(this.surface)[0];
    const state = this.geometry.attributes.state;
    const index = this.uvToTileIndex(hit.uv);

    if (this.lastHighlightIndex != null && state.getX(this.lastHighlightIndex) < 3) {
      state.setX(this.lastHighlightIndex, 1);
      state.needsUpdate = true;
    }

    if (state.getX(index) === 1) {
      this.lastHighlightIndex = index;
      state.setX(index, 2);
      state.needsUpdate = true;
    }
  }

  update(game) {
    const time = performance.now();
    this.uniforms.time.value = time;

    const tick = Math.floor(time / 16.0);

    if (tick % 16 === 0) {
      for (let i = 0; i < 5; i++) {
        if (this.rings.length === 0) {
          break;
        }

        const state = this.geometry.attributes.state;

        const ring = this.rings[this.rings.length - 1];

        const ringIndex = Math.floor(Math.random() * ring.length);
        const index = ring[ringIndex];

        ring.splice(ringIndex, 1);

        state.setX(index, performance.now());
        state.needsUpdate = true;

        if (ring.length === 0) {
          this.rings.pop();
        }
      }
    }
  }

  teardown(game) {
    this.unsubscribe();
  }

  uvToTileIndex(uv) {
    const x = uv.x;
    const y = uv.y;

    const q = Math.round(x * this.unitWidth);
    const offset = q % 2;
    const r = Math.round((y - q % 2 / this.unitWidth * 0.375) * this.unitHeight);

    return this.axialToTileIndex(q, r);
  }

  axialToTileIndex(q, r) {
    return q * this.unitWidth + r;
  }
}
