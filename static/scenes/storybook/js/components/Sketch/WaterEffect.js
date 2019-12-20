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
