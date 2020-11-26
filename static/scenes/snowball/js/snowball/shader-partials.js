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

export const constants = `
#define PI 3.1415926536
`;

export const rotate2d = `
vec2 rotate2d(float a, vec2 v){
  return mat2(cos(a), -sin(a), sin(a), cos(a)) * v;
}`;

export const erode = {
  vertex: `
vec3 erode(vec2 tileState, float time, vec3 position) {
  if (tileState.x == 3.0) {
    float shakeTime = tileState.y;
    float elapsed = (time - shakeTime) / 1000.0;
    float e3 = elapsed * elapsed * elapsed;

    float xOffset = sin((elapsed * 15.0)) *
        cos(elapsed * 25.0) *
        (3.0 + 3.0 * e3 - 5.0 * elapsed);

    float yOffset = max(e3 - 0.25, 0.0) * 15.0;

    if (elapsed <= 1.75) {
      position.x += xOffset;
      position.z -= yOffset;
    }
  }

  return position;
}`,
  fragment: `
float erode(vec2 tileState, float time) {
  float alpha = 1.0;

  if (tileState.x > 2.0) {
    float elapsed = (time - tileState.y) / 1000.0;
    float e3 = elapsed * elapsed * elapsed;
    alpha = min(1.35 - e3, 1.0);
  }

  return alpha;
}`
};

export const fade = `
float fade(vec2 tileState, float time) {
  float alpha = 1.0;

  if (tileState.x == 4.0) {
    time -= tileState.y;

    float elapsed = time / 300.0;
    alpha = max(1.0 - elapsed, 0.0);
  }

  return alpha;
}`;

export const sink = `
vec3 sink(vec2 tileState, float time, vec3 position) {
  if (tileState.x == 4.0) {
    time -= tileState.y;
    float elapsed = time / 300.0;

    float scale = min(1.0 + elapsed * 0.5, 2.0);
    float translate = pow(time / 50.0, 2.0);

    position.z -= translate;
    position.z /= scale;
  }

  return position;
}
`;

export const shake = `
vec3 shake(vec2 tileState, float time, vec3 position) {
  if (tileState.x == 3.0) {
    time -= tileState.y;

    float xOffset = sin(time / 70.0 * PI) * 1.0;

    position.x += xOffset;
  }

  return position;
}`;
