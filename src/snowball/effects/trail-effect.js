import { Entity } from '../../engine/core/entity.js';

const {
  BufferGeometry,
  BufferAttribute,
  Points,
  RawShaderMaterial,
  Object3D,
  Color
} = self.THREE;

const vertexShader = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

attribute vec3 position;
attribute vec2 uv;
attribute float displayTime;
attribute vec3 color;

varying vec3 vColor;
varying float vDisplayTime;

#define PI 3.14159

void main() {
  vColor = color;
  vDisplayTime = displayTime;

  float timeDelta = time - vDisplayTime;
  float elapsed = timeDelta / 700.0;

  float drop = 75.0 - sin(PI / 2.0 + PI / 2.0 * elapsed) * 75.0;
  float size = 7.5 - elapsed * 5.0;

  gl_PointSize = 5.0 * size;
  gl_Position = projectionMatrix * modelViewMatrix *
      vec4(position.x, position.y - drop, position.z, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float time;

varying vec3 vColor;
varying float vDisplayTime;

void main() {
  float timeDelta = time - vDisplayTime;

  if (vDisplayTime <= 0.0 || timeDelta >= 700.0) {
    discard;
  }

  float dist = 0.5 - abs(length(gl_PointCoord - vec2(0.5)));
  float show = dist;//smoothstep(0.0, 0.1, dist);

  float fade = timeDelta / 700.0;

  if (fade > 1.0) {
    discard;
  }

  gl_FragColor = vec4(vColor, (show - fade) / 3.0);
}
`;

const intermediateColor = new Color();

export class TrailEffect extends Entity(class {}) {
  constructor() {
    super();

    this.nextAvailableParticle = 0;
    this.maxParticles = 500;

    const positions = new BufferAttribute(
        new Float32Array(this.maxParticles * 3), 3).setDynamic(true);
    const colors = new BufferAttribute(
        new Float32Array(this.maxParticles * 3), 3).setDynamic(true);
    const displayTimes = new BufferAttribute(
        new Float32Array(this.maxParticles), 1).setDynamic(true);

    const uniforms = {
      time: {
        value: 0
      }
    };

    const geometry = new BufferGeometry();

    geometry.addAttribute('position', positions);
    geometry.addAttribute('color', colors);
    geometry.addAttribute('displayTime', displayTimes);


    const material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      side: 2,
      depthTest: false
    });

    this.trailedObjects = [];
    this.uniforms = uniforms;
    this.layer = new Points(geometry, material);
  }

  add(object) {
    this.trailedObjects.push(object);
  }

  remove(object) {
    this.trailedObjects.splice(
        this.trailedObjects.indexOf(object), 1);
  }

  update(game) {
    this.uniforms.time.value = game.clockSystem.time;

    for (let i = 0; i < this.trailedObjects.length; ++i) {
      const object = this.trailedObjects[i];
      const { trail } = object;

      if (trail && trail.showTest(game)) {
        const particleIndex = this.nextAvailableParticle;
        const { attributes } = this.layer.geometry;
        const { position, color, displayTime } = attributes;

        position.setXYZ(particleIndex,
            object.position.x, object.position.y, object.position.z + 1.0);

        intermediateColor.setHex(trail.color);

        color.setXYZ(particleIndex,
            intermediateColor.r, intermediateColor.g, intermediateColor.b);

        displayTime.setX(particleIndex, game.clockSystem.time);

        position.needsUpdate = color.needsUpdate = displayTime.needsUpdate = true;

        this.nextAvailableParticle = (particleIndex + 1) % this.maxParticles;
      }
    }
  }
}
