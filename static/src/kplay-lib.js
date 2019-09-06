
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
    const url = `${this._audioPath}/${file}.ogg`;

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
