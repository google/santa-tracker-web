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

const {
  TextureLoader
} = self.THREE;

const loader = new TextureLoader();

const textureMemo = assetPath => {
  let texture;

  return baseUrl => {
    if (texture == null) {
      texture = loader.load(`${baseUrl}${assetPath}`);
    }

    return texture;
  }
};

export const tiles = textureMemo('img/tiles.png');
export const snowball = textureMemo('img/snowball.png');
export const parachute = textureMemo('img/parachute.png');

