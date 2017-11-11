/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

export const vertex = `
uniform vec2 u_screenDims;
uniform vec2 u_transform;

attribute vec2 position;
attribute vec2 normal;
attribute float miter;
attribute float thickness;

varying float v_thickness;

void main() {
  // push the point along its normal by half thickness
  vec2 p = position.xy + vec2(normal * thickness/2.0 * miter);

  vec2 halfDims = u_screenDims / 2.0;
  vec2 updateCenter = vec2(p.x + halfDims.x, p.y + halfDims.y);

  v_thickness = thickness;

  vec4 screenTransform = vec4(2.0 / u_screenDims.x, -2.0 / u_screenDims.y, -1.0, 1.0);
  gl_Position = vec4((updateCenter + u_transform) * screenTransform.xy + screenTransform.zw, 0.0, 1.0);
}
`;

export const fragment = `
precision mediump float;

varying float v_thickness;

void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;
