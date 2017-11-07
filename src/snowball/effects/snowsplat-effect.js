import { Entity } from '../../engine/core/entity.js';
import { snowball } from '../textures.js';
import { constants, rotate2d } from '../shader-partials.js';

const {
  BufferGeometry,
  BufferAttribute,
  Points,
  RawShaderMaterial,
  Object3D
} = self.THREE;

const vertexShader = `

precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

attribute vec3 position;
attribute float displayTime;
attribute vec2 direction;
attribute float random;

varying float vDisplayTime;

${constants}
${rotate2d}

void main() {
  vDisplayTime = displayTime;

  float timeDelta = time - vDisplayTime;
  float elapsed = min(timeDelta / 300.0, 1.0);

  float spread = PI / -3.0 * random + PI / 6.0;

  vec2 dist = rotate2d(spread, direction) * fract(random * 7.158) * 85.0 * elapsed;

  dist.y -= pow(3.0 * elapsed, 2.0);

  gl_PointSize = (20.0 * random + 25.0) * (1.0 - elapsed);
  gl_Position = projectionMatrix * modelViewMatrix *
      vec4(position.xy + dist, position.z, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D map;
uniform float time;

varying float vDisplayTime;

void main() {
  float timeDelta = time - vDisplayTime;
  float elapsed = min(timeDelta / 300.0, 1.0);

  float alpha = elapsed;

  if (alpha >= 1.0) {
    discard;
  }

  vec4 color = texture2D(map, gl_PointCoord);

  if (color.a > 0.5) {
    color.a = alpha;
  }

  gl_FragColor = color;
}
`;

export class SnowsplatEffect extends Entity(class {}) {
  constructor() {
    super();

    this.nextAvailableParticle = 0;
    this.maxParticles = 2000;

    const position = new BufferAttribute(
        new Float32Array(this.maxParticles * 3), 3).setDynamic(true);

    const direction = new BufferAttribute(
        new Float32Array(this.maxParticles * 2), 2).setDynamic(true);

    const displayTime = new BufferAttribute(
        new Float32Array(this.maxParticles), 1).setDynamic(true);

    const random = new BufferAttribute(
        new Float32Array(this.maxParticles), 1);

    for (let i = 0; i < this.maxParticles; ++i) {
      random.setX(i, Math.random());
    }

    const geometry = new BufferGeometry();

    geometry.addAttribute('position', position);
    geometry.addAttribute('direction', direction);
    geometry.addAttribute('displayTime', displayTime);
    geometry.addAttribute('random', random);

    const uniforms = {
      time: {
        value: 0
      },
      map: {
        value: snowball
      }
    };

    const material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      side: 2
    });

    this.uniforms = uniforms;
    this.layer = new Points(geometry, material);
    this.layer.frustumCulled = false;
    this.splats = [];
  }

  show(position, direction) {
    this.splats.push({ position, direction });
  }

  update(game) {
    this.uniforms.time.value = game.clockSystem.time;

    while (this.splats.length) {
      const splat = this.splats.pop();
      const particleIndex = this.nextAvailableParticle;
      const { position, direction, displayTime } =
          this.layer.geometry.attributes;

      for (let i = 0; i < 5; ++i) {
        position.setXYZ(particleIndex + i,
            splat.position.x, splat.position.y, splat.position.z);

        direction.setXY(particleIndex + i, splat.direction.x, splat.direction.y);
        displayTime.setX(particleIndex + i, game.clockSystem.time);
      }

      position.needsUpdate =
          direction.needsUpdate =
          displayTime.needsUpdate = true;

      this.nextAvailableParticle = (this.nextAvailableParticle + 5) % this.maxParticles;
    }
  }
}
