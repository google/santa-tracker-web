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

goog.provide('app.AnimationManager');

// singleton to manage the game
class AnimationManager {
  constructor() {
    this.animations = {};
  }

  init(api, lottiePrepareAnimation) {
    // we have to do that because we can't mix an `import api from '../../src/scene/api.js'` and goog.provide()
    this.api = api;
    this.lottiePrepareAnimation = lottiePrepareAnimation;
  }

  prepareAnimation(path, container, side, callback, apiPreload) {
    const p = this.lottiePrepareAnimation(path, {
      container,
      loop: false,
      autoplay: false,
      rendererSettings: {
        className: `animation animation--${side}`
      },
    }).then((anim) => {
      callback(anim)
    });

    if (apiPreload) {
      this.api.preload.wait(p);
    }
  }
}

app.AnimationManager = new AnimationManager();
