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


import {_static} from '../magic.js';

/**
 * @param {string} sceneName to load a feature image for
 * @return {!Promise<!Image>}
 */
export function sceneImage(sceneName) {
  // TODO: use normalizeSceneName
  if (!sceneName) {
    return Promise.reject('invalid scene name');
  }

  const base = _static`img/scenes/` + sceneName;
  const img = document.createElement('img');
  img.src = base + (window.devicePixelRatio > 1 ? '_2x.png' : '_1x.png');
  img.srcset = `${base}_1x.png, ${base}_2x.png 2x`;

  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};
