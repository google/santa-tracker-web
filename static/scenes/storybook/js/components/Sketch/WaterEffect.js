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

import { Effect } from "../../../../../third_party/lib/three/postprocessing/postprocessing.js";
import * as THREE from "../../../../../third_party/lib/three/build/three.module.js";

const fragment = `
uniform sampler2D uTexture;
uniform float uIntensity;
#define PI 3.14159265359

void mainUv(inout vec2 uv) {
  vec4 tex = texture2D(uTexture, uv);
  float angle = -((tex.r) * (PI * 2.) - PI) ;
  float vx = -(tex.r *2. - 1.);
  float vy = -(tex.g *2. - 1.);
  float intensity = tex.b;
  uv.x += vx * uIntensity * intensity;
  uv.y += vy * uIntensity * intensity;
}
`;

export default class WaterEffect extends Effect {
  constructor(options = {}) {
    super("WaterEffect", fragment, {
      uniforms: new Map([
        ["uTexture", new THREE.Uniform(options.texture)],
        ["uIntensity", new THREE.Uniform(0.03)]
      ])
    });
  }
}
