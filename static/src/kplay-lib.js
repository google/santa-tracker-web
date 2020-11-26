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


const oggSupport = (new Audio().canPlayType('audio/ogg'));
const audioExt = oggSupport ? '.ogg' : '.mp3';

export class AudioLoader {
  constructor(context, audioPath, callback=null) {
    this._context = context;
    this._audioPath = audioPath;
    this._callback = callback;
    this._pending = {};
    this._buffers = {};
  }

  async _internalLoad(file) {
    // TODO: .ogg vs .mp3
    const url = `${this._audioPath}/${file}${audioExt}`;

    const response = await window.fetch(url);
    if (!response.ok) {
      return null;  // not an error, audio actually is missing
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Promise((resolve, reject) => {
      // Use 'safe' non-Promise method.
      this._context.decodeAudioData(arrayBuffer, resolve, reject);
    });
  }

  /**
   * @param {string} file
   * @return {?AudioBuffer}
   */
  get(file) {
    return this._buffers[file] || null;
  }

  /**
   * @param {string} key
   * @param {string} file
   * @return {?Promise<?AudioBuffer>}
   */
  optionalPreload(key, file) {
    if (key in this._buffers) {
      return null;
    }
    return this.preload(key, file);
  }

  /**
   * @param {string} key
   * @param {string} file
   * @return {!Promise<?AudioBuffer>}
   */
  preload(key, file) {
    const previous = this._pending[key];
    if (previous !== undefined) {
      return previous;
    }

    // TODO: We'll do do multiple fetches for dup key => file mappings.
    const p = this._internalLoad(file);
    this._pending[key] = p;

    const failure = (err) => {
      // ignore error and force a retry
      delete this._pending[key];
      return null;
    };
    const success = (buffer) => {
      this._buffers[key] = buffer;
      this._callback && this._callback(key, buffer);
    };

    p.then(success, failure);  // same callback, failure in success !=> failure callback
    return p;
  }
}
