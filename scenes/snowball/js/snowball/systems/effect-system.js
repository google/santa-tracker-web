import { TrailEffect } from '../effects/trail-effect.js';
import { SnowsplatEffect } from '../effects/snowsplat-effect.js';

const {
  BufferGeometry,
  BufferAttribute,
  Points,
  RawShaderMaterial,
  AdditiveBlending,
  Object3D,
  Color
} = self.THREE;


export class EffectSystem {
  constructor() {
    this.trailedObjects = [];
    this.effectsLayer = new Object3D();

    this.trailEffect = new TrailEffect();
    this.snowsplatEffect = new SnowsplatEffect();

    this.effectsLayer.add(this.trailEffect.layer);
    this.effectsLayer.add(this.snowsplatEffect.layer);
  }

  teardown(game) {
    this.trailEffect.teardown(game);
    this.snowsplatEffect.teardown(game);
  }

  update(game) {
    this.trailEffect.update(game);
    this.snowsplatEffect.update(game);
  }
};
