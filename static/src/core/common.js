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


/**
 * @fileoverview Common calls available to both prod and static code.
 */

export const preloadEvent = '__santa-preload';
export const playEvent = '__santa-play';
export const goEvent = '__santa-go';
export const internalSoundPreload = '__santa-klang-preload';


/**
 * Play the audio globally.
 *
 * @param {...string} args
 */
export function play(...args) {
  const ce = new CustomEvent(playEvent, {detail: args});
  window.dispatchEvent(ce);
}


/**
 * Route to the specified page.
 *
 * @param {string} route
 */
export function go(route) {
  const ce = new CustomEvent(goEvent, {detail: route});
  window.dispatchEvent(ce);
}


const wait = (function() {
  const tasks = [];
  let announce = null;

  return (...all) => {
    tasks.push(...all);
    if (announce !== null || !all.length) {
      return;  // done
    }

    // Otherwise, announce after a microtask.
    announce = Promise.resolve().then(() => {
      announce = null;
      const detail = tasks.splice(0, tasks.length);  // empty tasks and send copy
      const ce = new CustomEvent(preloadEvent, {detail});
      window.dispatchEvent(ce);
    });
  };
}());


export const preload = Object.freeze({

  /**
   * Waits for the passed promises to resolve before loading.
   *
   * @param {...!Promise<*>} all
   */
  wait,

  /**
   * Preloads the passed images.
   *
   * @param {...string} all image URLs to preload
   * @return {!Array<!Promise<!Image>>} resolved image instances
   */
  images(...all) {
    const safe = [];
    const preloads = all.map((src) => {
      const image = new Image();
      image.src = src;

      const out = new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
      });
      safe.push(out.catch(() => image));
      return out;
    })

    wait(...preloads);

    // Return the result Image instances, even if they fail to load.
    return safe;
  },

  /**
   * Preloads the passed assets (including failure to load).
   *
   * @param {...(string|!Image)} all
   */
  assets(...all) {
    const preloads = all.map((cand) => {
      let asset;
      let loadEvent = 'load';

      if (typeof cand === 'string') {
        // TODO(samthor): .mp3/.ogg etc
        asset = new Image();
        asset.src = cand;
      } else if (cand instanceof Image) {
        asset = cand;
      } else if (cand instanceof HTMLMediaElement) {
        asset = cand;
        loadEvent = 'canplaythrough';
      } else {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        asset.addEventListener(loadEvent, () => resolve(asset), {once: true});
        asset.addEventListener('error', reject, {once: true});
      });
    });

    wait(...preloads);
  },

  /**
   * Preloads the given Klang groups.
   *
   * @param {...string} groups
   */
  sounds(...groups) {
    const ce = new CustomEvent(internalSoundPreload, {detail: groups});
    window.dispatchEvent(ce);
  },

});