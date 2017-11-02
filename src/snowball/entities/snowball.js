import { Entity } from '../../engine/core/entity.js';
import { Point, Circle } from '../../engine/utils/collision-2d.js';
import { Allocatable } from '../../engine/utils/allocatable.js';
import { snowball } from '../textures.js';
import { Trail } from '../components/trail.js';

const {
  Mesh,
  Vector2,
  BoxGeometry,
  MeshBasicMaterial,
  RawShaderMaterial,
  PlaneBufferGeometry
} = self.THREE;

const PI_OVER_TWELVE = Math.PI / 12.0;
const PI_OVER_SIX = Math.PI / 6.0;

const vertexShader = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float random;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying float vRandom;

void main() {
  vUv = uv;
  vRandom = random;
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
varying float vRandom;

void main() {
  float elapsed = time / (1000.0 + 5000.0 * vRandom);
  vec2 halfUv = vec2(0.5);
  vec2 rUv = rotate2d(elapsed * 3.14159 * 2.0, vUv - halfUv) + halfUv;
  vec4 color = texture2D(map, rUv);

  color -= vec4(0.05, 0.015, 0.0, 0.0) * cos(time / 30.0 * vRandom);

  gl_FragColor = color;
}
`;

export class Snowball extends Allocatable(Entity(Mesh)) {
  constructor() {
    const uniforms = {
      map: {
        value: snowball
      },
      time: {
        value: 0
      },
      random: {
        value: Math.random()
      }
    };

    super(new PlaneBufferGeometry(12, 12),
        new RawShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          side: 2,
          transparent: true
        }));

    this.uniforms = uniforms;
    this.collider = Circle.allocate(5, this.position);
    this.targetPosition = new Vector2();
    this.origin = new Vector2();

    this.trail = new Trail(5, 0xaaccff, game => this.thrown);
  }

  onAllocated(origin) {
    this.origin.copy(origin);
    this.position.copy(origin);
    this.thrown = false;
    this.tickWhenThrown = -1;
    this.targetPosition.set(0, 0);
    this.skew = 0;
    this.collidedWith = null;
    this.visible = false;
  }

  setup(game) {
    const { collisionSystem, effectSystem } = game;

    this.unsubscribeFromCollisions = collisionSystem.handleCollisions(this,
        (snowball, collidable) => {
          this.collidedWith = collidable;
          this.visible = false;
        });

    effectSystem.trailEffect.add(this);
  }

  teardown(game) {
    const { effectSystem } = game;
    this.unsubscribeFromCollisions();
    effectSystem.trailEffect.remove(this);
  }

  update(game) {
    this.uniforms.time.value = game.clockSystem.time;

    if (!this.thrown) {
      return;
    }

    if (this.tickWhenThrown === -1) {
      this.tickWhenThrown = game.tick;
    }
  }

  throwAt(target) {
    if (!this.thrown) {
      this.visible = true;
      this.thrown = true;
      this.targetPosition.copy(target);

      // ±15º skew on the throw
      this.skew = Math.random() * PI_OVER_SIX - PI_OVER_TWELVE;
    }
  }

  deserialize(object) {
    Object.assign(this, object);
  }

  serialize() {
    return {
      thrown: this.thrown,
      tickWhenThrown: this.tickWhenThrown,
      skew: this.skew,
      target: {
        x: this.target.x,
        y: this.target.y
      },
      position: {
        x: this.position.x,
        y: this.position.y
      }
    };
  };
};

window.S = Snowball;

