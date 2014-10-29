/**
 * @constructor
 */
function AudioController() {
  /**
   * @type {?AudioBuffer}
   * @private
   */
  this.audioBuffer_ = null;

  /**
   * @type {?AudioBufferSourceNode}
   * @private
   */
  this.source_ = null;

  /**
   * @type {?AudioContext}
   * @private
   */
  this.audioContext_ = null;

  /**
   * @type {boolean}
   */
  this.loaded = false;

  if (this.isSupported) {
    if ('AudioContext' in window) {
      this.audioContext_ = new window.AudioContext();
    } else {
      this.audioContext_ = new window.webkitAudioContext();
    }
  }
}

/**
 * @type {boolean}
 */
AudioController.prototype.isSupported = 'AudioContext' in window ||
                                        'webkitAudioContext' in window;

/**
 * Loads an audio file by URL for play later.
 *
 * @param {string} url The audio file to load.
 * @param {Function=} opt_callback Optional callback when file is fully loaded.
 */
AudioController.prototype.load = function(url, opt_callback) {
  this.loaded = false;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';

  var that = this;
  xhr.onload = function(e) {
    that.audioContext_.decodeAudioData(this.response, function(buffer) {
      that.audioBuffer_ = buffer;
      that.loaded = true;
      if (opt_callback) {
        opt_callback();
      }
    });
  }
  xhr.send();
};

/**
 * Plays the audio buffer.
 *
 * @param {number=} opt_gain Optional gain value to set the volume.
 * @param {boolean=} opt_loop True to loop the sound.
 */
AudioController.prototype.play = function(opt_gain, opt_loop) {
  if (this.isSupported && this.loaded && this.audioBuffer_) {
    this.source_ = this.audioContext_.createBufferSource();
    this.source_.buffer = this.audioBuffer_;
    this.source_.loop = opt_loop || false;

    var gainNode = this.audioContext_.createGainNode();
    gainNode.gain.value = opt_gain || 1.0;
    this.source_.connect(gainNode);
    gainNode.connect(this.audioContext_.destination);

    this.source_.noteOn(0); // deprecated in Web Audio in Chrome Canary.
    //this.source_.start(0);
  }
};

/**
 * Stops playing audio.
 */
AudioController.prototype.stop = function() {
  if (this.source_) {
    this.source_.noteOff(0); // deprecated in Web Audio in Chrome Canary.
    //this.source_.stop(0);
  }
};
