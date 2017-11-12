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

// Center of the sprite in screen coordinates
attribute vec2 centerPosition;

// Offset of the sprite's origin.
attribute float offsetY;

// Layer to push this sprite into.
attribute float layer;

// Transform of the whole screen.
uniform vec2 u_transform;

// Rotation to draw sprite at
attribute float rotation;

// Per-sprite frame offset.
attribute float spriteIndex;

// Sprite size in screen coordinates
attribute float spriteSize;

// Offset of this vertex's corner from the center, in normalized
// coordinates for the sprite. In other words:
//   (-0.5, -0.5) => Upper left corner
//   ( 0.5, -0.5) => Upper right corner
//   (-0.5,  0.5) => Lower left corner
//   ( 0.5,  0.5) => Lower right corner
attribute vec2 cornerOffset;

// Specified in normalized coordinates (0.0..1.0), where 1.0 = spriteSize.
attribute vec2 spriteTextureSize;

// Number of sprites per row of texture
attribute float spritesPerRow;

// Output to the fragment shader.
varying vec2 v_texCoord;

void main() {
  float row = floor(spriteIndex / spritesPerRow);
  float col = (spriteIndex - (row * spritesPerRow));

  vec2 upperLeftTC = vec2(spriteTextureSize.x * col, spriteTextureSize.y * row);

  // Get the texture coordinate of this vertex (cornerOffset is in [-0.5,0.5])
  v_texCoord = upperLeftTC + spriteTextureSize * (cornerOffset + vec2(0.5, 0.5));

  // Shift to center of screen, base of sprite.
  // TODO: We could make the origin configurable.
  vec2 halfDims = u_screenDims / 2.0;
  vec2 updateCenter = vec2(centerPosition.x + halfDims.x,
                           centerPosition.y + halfDims.y - spriteSize / 2.0 + offsetY);

  // Rotate as appropriate
  float s = sin(rotation);
  float c = cos(rotation);
  mat2 rotMat = mat2(c, -s, s, c);
  vec2 scaledOffset = spriteSize * cornerOffset;
  vec2 pos = updateCenter + rotMat * scaledOffset;

  // depth goes from 0-1, where 0=(-screenDims.y) and 1=(2*screenDims.y)
  float depthRange = u_screenDims.y * 3.0;
  float depth = 1.0 - (updateCenter.y + u_screenDims.y + u_transform.y) / depthRange;
  depth = depth - layer;

  vec4 screenTransform = vec4(2.0 / u_screenDims.x, -2.0 / u_screenDims.y, -1.0, 1.0);
  gl_Position = vec4((pos + u_transform) * screenTransform.xy + screenTransform.zw, depth, 1.0);
}
`;

export const fragment = `
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_texCoord;

void main() {
  vec4 color = texture2D(u_texture, v_texCoord);

  if (color.a == 0.0) {
    // sanity discard if blend mode is bad
    discard;
  }

  gl_FragColor = color;
}
`;
