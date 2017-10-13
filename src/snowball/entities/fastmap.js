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

const vertexShader = `
attribute float visibility;

varying vec2 vUv;
varying vec3 vPosition;
varying float vVisibility;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vPosition = position;
  vVisibility = visibility;
}
`;

const fragmentShader = `
vec2 rotate2d(float angle, vec2 v){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle)) * v;
}

// Hexagon created by inigo quilez - iq/2014
// @see https://www.shadertoy.com/view/Xd2GR3
// @returns vec4( 2d cell id, distance to border, distance to center )
vec4 hexagon(vec2 p)
{
  p = rotate2d(3.14 / 6.0, p);
  vec2 q = vec2(p.x * 2.0 * 0.5773503, p.y + p.x * 0.5773503);

  vec2 pi = floor(q);
  vec2 pf = fract(q);

  float v = mod(pi.x + pi.y, 3.0);

  float ca = step(1.0, v);
  float cb = step(2.0, v);
  vec2  ma = step(pf.xy, pf.yx);

    // distance to borders
  float e = dot(ma,
      1.0 - pf.yx +
      ca * (pf.x + pf.y - 1.0) +
      cb * (pf.yx - 2.0 * pf.xy));

  // distance to center
  p = vec2(q.x + floor(0.5 + p.y / 1.5), 4.0 * p.y / 3.0) * 0.5 + 0.5;

  float f = length((fract(p) - 0.5) * vec2(1.0, 0.85));

  return vec4(pi + ca - cb * ma, e, f);
}

vec2 resolution = vec2(300, 300);

varying vec2 vUv;
varying vec3 vPosition;
varying float vVisibility;

void main()
{
  vec2 pos = vUv * resolution / 32.0 * vec2(1.0, 1.25);
  //vec4 hex = hexagon(pos);
  vec4 hex = hexagon(vPosition.xy / 10.0);

  vec2 coord = vUv * 2.0 - 1.0;

  vec2 normalId = normalize(hex.xy);

  float show = smoothstep(13.0, 13.01, length(hex.xy));

  gl_FragColor = vec4(0.0) + smoothstep(0.05, 0.08, hex.z) * step(0.5, vVisibility);


  /*
  vec2 uv = gl_FragCoord.xy;
  vec2 pos = (-resolution.xy + 2.0 * gl_FragCoord.xy) / resolution.y;

  float verticalScale = 1.25;
  float mapScale = 10.0;

  vec2 hexPos = pos * vec2(mapScale, mapScale + verticalScale);
  vec4 hex = hexagon(hexPos);

  float borderDistance = hex.z;
  //float centerDistance = h.w;

  vec3 col = vec3(smoothstep(0.05, 0.08, borderDistance)) + vec3(0.25);

  //float islandDistance = length(abs(pos + hex.z));

  col *= 1.0 - step(10.0, length(hex.y));

  vec4 blue = vec4(0.44, 0.65, 0.86, 1.0);

  gl_FragColor = blue + vec4( col, 1.0 );
  */
}`;

const vert = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float scale;
uniform vec2 size;

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
  vShouldHighlight = step(step(1.0, vState), 3.0);

  gl_Position = projectionMatrix * modelViewMatrix * scaledPosition;
}
`;

const frag = `
precision highp float;

uniform sampler2D map;
uniform float scale;
uniform vec2 highlight;

varying vec2 vUv;
varying float vState;
varying float vShouldHighlight;

void main() {
  vec4 color = texture2D(map, vUv);
  float alpha = smoothstep(0.75, 0.8, color.a);

  if (alpha < 0.01 || vState < 1.0) {
    discard;
  }

  gl_FragColor = vShouldHighlight * vec4(1.0, 0.0, 0.0, 0.0) + vec4(0.0, 0.0, 0.0, 1.0);
  //gl_FragColor = color;
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
          state.setX(i, value);
        }

        offsets.setXYZ(i, cell.x, cell.y, cell.y / 10.0);
      }
    }

    geometry.addAttribute('offset', offsets);
    geometry.addAttribute('state', state);

    const texture = new TextureLoader().load('/subg-terrain/hex_land.png');
    const uniforms = {
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
    console.log('Pick!', event.detail.intersections);
  }

  onMove(event) {
    const hit = event.detail.hits.get(this.surface)[0];
    const state = this.geometry.attributes.state;
    const index = this.uvToTileIndex(hit.uv);

    console.log('Move!', hit);
    if (this.lastHighlightIndex != null) {
      state.setX(this.lastHighlightIndex, 1);
    }

    console.log(index);
    if (state.getX(index) === 1) {
      state.setX(index, 2);
    }
    //this.uniforms.highlight.value.copy(hit.uv);
  }

  teardown(game) {
    this.unsubscribe();
  }

  uvToTileIndex(uv) {
    const q = Math.floor(uv.x * this.unitWidth);
    const r = Math.floor(uv.y * this.unitHeight);

    return this.axialToTileIndex(q, r);
  }

  axialToTileIndex(q, r) {
    return q * this.unitWidth + r;
  }
}
