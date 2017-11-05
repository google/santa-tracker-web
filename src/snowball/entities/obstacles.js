import { Entity } from '../../engine/core/entity.js';
import { Rectangle, Circle } from '../../engine/utils/collision-2d.js';
import { tiles } from '../textures.js';
import { erode } from '../shader-partials.js';

const {
  Mesh,
  Object3D,
  BufferAttribute,
  RawShaderMaterial,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  PlaneBufferGeometry
} = self.THREE;

const vertexShader = `
precision highp float;

#define PI 3.1415926536

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float tileScale;
uniform float time;
uniform float tileHeight;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 tileOffset;
attribute vec2 tileState;
attribute float tileObstacle;

varying vec2 vUv;
varying vec2 vTileState;
varying float vTileObstacle;
varying vec3 vPosition;

${erode.vertex}

vec2 rotate2d(float r, vec2 v){
  return mat2(cos(r), -sin(r), sin(r), cos(r)) * v;
}

void main() {
  vec3 offsetPosition = tileOffset * tileScale;
  vec3 scaledPosition = position * tileScale;

  scaledPosition.y += tileHeight / 2.0;

  vec3 finalPosition = erode(tileState, time, scaledPosition + offsetPosition);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);

  vec2 uvOffset = vec2(mod(tileObstacle, 4.0), (3.0 - floor(tileObstacle / 4.0))) / 4.0;
  vUv = uvOffset + uv / 4.0;
  vPosition = position;
  vTileState = tileState;
  vTileObstacle = tileObstacle;
}
`;

const fragmentShader = `
precision highp float;

uniform float scale;
uniform float time;
uniform sampler2D map;

varying vec2 vUv;
varying vec2 vTileState;
varying float vTileObstacle;
varying vec3 vPosition;

${erode.fragment}

void main() {
  if (vTileState.x < 1.0 || vTileObstacle < 0.0) {
    discard;
  }

  vec4 color = texture2D(map, vUv);

  vec2 border = mod(vUv, 0.25);

  #ifdef debug

  if (border.x > 0.0 && border.x < 0.01 || border.x > 0.24 && border.x < 0.25 || border.y > 0.0 && border.y < 0.01 || border.y > 0.24 && border.y < 0.25) {
    color = vec4(1.0, 0.0, 0.0, 0.25);
  }

  #endif

  color.a *= erode(vTileState, time);

  if (color.a < 0.1) {
    discard;
  }

  gl_FragColor = color;
}
`;

const orientationMesh = new Mesh();

orientationMesh.rotation.x += Math.PI / 6.0;
orientationMesh.updateMatrix();

export class Obstacles extends Entity(Object3D) {
  setup(game) {
    const { mapSystem } = game;
    const { map, grid } = mapSystem;

    const uniforms = {
      time: {
        value: 0
      },
      map: {
        value: tiles
      },
      tileScale: {
        value: grid.cellSize
      },
      tileHeight: {
        value: grid.cellHeight
      }
    };

    const planeGeometry = new PlaneBufferGeometry(2.0, 2.0);

    const geometry = new InstancedBufferGeometry();
    const material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true
    });

    planeGeometry.applyMatrix(orientationMesh.matrix);

    Object.assign(geometry.attributes, planeGeometry.attributes);
    geometry.setIndex(planeGeometry.index);

    geometry.addAttribute('tileOffset', map.tileOffsets);
    geometry.addAttribute('tileState', map.tileStates);
    geometry.addAttribute('tileObstacle', map.tileObstacles);

    const mesh = new Mesh(geometry, material);

    mesh.position.x -= grid.pixelWidth / 2.0;
    mesh.position.y += grid.pixelHeight / 2.0;
    mesh.position.z = grid.cellSize * 0.75;
    mesh.frustumCulled = false;

    this.add(mesh);
    this.mesh = mesh;

    this.uniforms = uniforms;
  }

  update(game) {
    this.uniforms.time.value = performance.now();
  }
}
