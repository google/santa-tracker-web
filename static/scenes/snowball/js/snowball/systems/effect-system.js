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
