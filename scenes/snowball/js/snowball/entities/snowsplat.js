import { Entity } from '../../engine/core/entity.js';
import { Allocatable } from '../../engine/utils/allocatable.js';
import { snowball } from '../textures.js';

const {
  Points,
  RawShaderMaterial,
  BufferGeometry,
  BufferAttribute
} = self.THREE;

const vertexShader = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

vec2 rotate2d(float angle, vec2 v){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle)) * v;
}

uniform sampler2D map;
uniform float time;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(map, vUv);
  gl_FragColor = color;
}
`;

class Snowsplat extends Allocatable(Entity(Points)) {
  constructor(particleCount = 5) {
    const uniforms = {
      map: {
        value: snowball
      },
      time: {
        value: 0
      }
    };

    const geometry = new BufferGeometry();
    const sizes = new Float32Array(particleCount);
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; ++i) {
      sizes[i] = Math.random();
    }

    geometry.addAttribute('size', new BufferAttribute(sizes, 1));
    geometry.addAttribute('position', new BufferAttribute(positions, 3));

    super();

    this.uniforms = uniforms;
  }

  update(game) {
    this.uniforms.time.value = game.clockSystem.time;
  }
}
