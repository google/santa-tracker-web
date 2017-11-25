/*
 * Copyright 2015 Google Inc. All rights reserved.
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

goog.provide('SoundController');

/**
 * Klang script source URL.
 */
const klangSrc = 'third_party/lib/klang/klang.js';

/**
 * Klang config file URL.
 */
const klangConfigSrc = 'third_party/lib/klang/config.js';
//const klangConfigSrc = 'http://klangfiles.s3.amazonaws.com/uploads/projects/bNsac/config.js';

/**
 * @constructor
 * @struct
 * @param {string} baseUrl to load resources under
 * @export
 */
SoundController = function SoundController(baseUrl) {
  /** @private {!Promise<void>} */
  this.klangLoaded_ = new Promise((resolve, reject) => {
    const klangScript = document.createElement('script');
    klangScript.src = baseUrl + klangSrc;
    klangScript.onload = () => {
      // resolve klangLoaded_ when the config is loaded
      resolve(this.loadKlangConfig_(baseUrl));
    };
    klangScript.onerror = reject;
    document.head.appendChild(klangScript);
  });

  /** @private {boolean} */
  this.isKlangLoaded_ = false;

  /**
   * The name of the most recently requested set of sounds, or null if the last
   * requested set of sounds is loaded.
   * @private {?string}
   */
  this.loadingSounds_ = null;

  // run op to set sync bool
  this.klangLoaded_.then(() => this.isKlangLoaded_ = true);
}

/**
 * Sounds can be played by either directly by supplying the name, or as an
 * object with the sound name and any optional arguments necessary to play it.
 * @typedef {string|{name: string, args: (Array<*>|undefined)}}
 */
SoundController.SoundDetail;

/**
 * Loads the Klang config file; called onload of the Klang library.
 * @param {string} baseUrl to load resources under
 * @return {!Promise<void>}
 * @private
 */
SoundController.prototype.loadKlangConfig_ = function(baseUrl) {
  return new Promise((resolve, reject) => {
    Klang.init(baseUrl + klangConfigSrc, (success) => {
      if (!success) {
        reject(new Error('Klang failed to load config'));
        return;
      }

      document.addEventListener('touchend', function startIOS() {
        Klang.initIOS();
        console.debug('initIOS');
        document.removeEventListener('touchend', startIOS);
      });

      resolve();
    });
  });
};

/**
 * Load a set of sounds, returning a Promise for their load.
 * @param {{detail: string}} loadEvent
 * @return {!Promise<void>}
 * @export
 */
SoundController.prototype.loadSounds = function(loadEvent) {
  this.loadingSounds_ = loadEvent.detail;

  return this.klangLoaded_.then(() => {
    // once Klang is loaded...
    return new Promise((resolve, reject) => {
      if (loadEvent.detail === this.loadingSounds_) {
        // TODO(samthor): This is disused now that we're Promise-based.
        this.loadingSounds_ = null;
      }

      Klang.triggerEvent(loadEvent.detail, resolve, () => {}, reject);
    });
  });
};

/**
 * Play a Klang ambient-sound "script" based on a`sound-ambient` event.
 * Ambient sounds include the soundtrack and any environmental noises that are
 * scripted in a sequence inside of Klang's config file.
 * @param {{detail: SoundController.SoundDetail}} loadEvent
 * @return {!Promise<void>}
 * @export
 */
SoundController.prototype.playAmbientSounds = function(loadEvent) {
  return this.klangLoaded_.then(() => this.triggerSound_(loadEvent.detail));
};

/**
 * Play a transient sound based on a `sound-trigger` event. Transient sounds are
 * sounds like an on-click sound, or a missed-objective sound in a game.
 * @param {{detail: SoundController.SoundDetail}} loadEvent
 * @export
 */
SoundController.prototype.playSound = function(loadEvent) {
  // transient sounds aren't important, so attempt to play if Klang itself is
  // loaded, even if the scene's sounds are not. Some sounds are shared between
  // scenes, so it's possible it's already loaded, and if not, this particular
  // sound event likely won't be relevant by the time it is loaded.
  if (this.isKlangLoaded_) {
    this.triggerSound_(loadEvent.detail);
  }
};

/**
 * Actually trigger the sound via Klang. Should not be called until after Klang
 * has finished loading.
 * @param {SoundController.SoundDetail} sound
 * @private
 */
SoundController.prototype.triggerSound_ = function(sound) {
  const soundName = (typeof sound === 'string') ? sound : sound.name;
  const args = [soundName];

  if (sound['args'] && Array.isArray(sound['args'])) {
    [].push.apply(args, sound['args']);
  }
  Klang.triggerEvent.apply(Klang, args);
};
