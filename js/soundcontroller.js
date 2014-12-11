/* global Klang */

/**
 * @constructor
 * @struct
 * @param {function(string)} loadCallback Callback to be notified when a set of
 *     sounds are loaded.
 */
function SoundController(loadCallback) {
  // load Klang
  var klangScript = document.createElement('script');
  klangScript.src = SoundController.klangSrc_;

  klangScript.addEventListener('load', this.loadKlangConfig_.bind(this));
  document.head.appendChild(klangScript);

  /**
   * A queue of the sounds to load as soon as Klang is ready to go.
   * @private {!Array<string>}
   */
  this.loadQueue_ = [];

  /**
   * A queue of the sounds to play as soon as the currently loading sounds
   * finish downloading.
   * @private {!Array<SoundController.SoundDetail>}
   */
  this.soundQueue_ = [];

  /**
   * Whether Klang and the config file have finished loading.
   * @private {boolean}
   */
  this.klangLoaded_ = false;

  /**
   * The name of the most recently requested set of sounds, or null if the last
   * requested set of sounds is loaded.
   * @private {?string}
   */
  this.loadingSounds_ = null;

  /**
   * Optional callback to be notified when a set of sounds are loaded.
   * @private {function(string)}
   */
  this.loadCallback_ = loadCallback;
}

/**
 * Sounds can be played by either directly by supplying the name, or as an
 * object with the sound name and any optional arguments necessary to play it.
 * @typedef {string|{name: string, args: (Array<*>|undefined)}}
 */
SoundController.SoundDetail;

/**
 * Klang script source URL.
 * @private {string}
 */
SoundController.klangSrc_ = 'js/third_party/klang/klang.js';

/**
 * Klang config file URL.
 * @private {string}
 */
SoundController.klangConfigSrc_ = 'js/third_party/klang/config.json';

/**
 * Loads the Klang config file; called onload of the Klang library.
 * @private
 */
SoundController.prototype.loadKlangConfig_ = function() {
  // load config script
  Klang.init(SoundController.klangConfigSrc_, function(success) {
    if (success) {
      console.log('Klang loaded');
      this.klangLoaded_ = true;

      // Run any queued loads of sound sets. Usually only one set of sounds has
      // been queued, but prioritize the most recent in case of more.
      for (var i = this.loadQueue_.length - 1; i >= 0; i--) {
        this.triggerSoundsLoad_(this.loadQueue_[i]);
      }
      this.loadQueue_ = [];
    } else {
      console.log('Klang failed to load');
    }
  }.bind(this));
};

/**
 * Load a set of sounds based on a `sound-preload` event.
 * @param {{detail: SoundController.SoundDetail}} loadEvent
 */
SoundController.prototype.loadSounds = function(loadEvent) {
  this.loadingSounds_ = /** @type {string} */(loadEvent.detail);

  // a new load has been triggered, so cancel any existing queued ambient sounds
  this.soundQueue_ = [];

  if (!this.klangLoaded_) {
    // Sound loads predominantly only happen in onPreload, so will only be
    // done once, so if Klang hasn't finished loading, queue sound load calls.
    this.loadQueue_.push(this.loadingSounds_);
    return;
  }
  
  this.triggerSoundsLoad_(this.loadingSounds_);
};

/**
 * Actually trigger the sound load via Klang. Should not be called until after
 * Klang has finished loading.
 * @param {string} soundsName
 * @private
 */
SoundController.prototype.triggerSoundsLoad_ = function(soundsName) {
  // Klang is already loaded, so attempt to load sound files
  Klang.triggerEvent(soundsName,
    function success() {
      console.log('Klang: loaded sound ' + soundsName);
      this.loadCallback_(soundsName);

      // If this is also the most recently loaded set of sounds, play all queued
      // ambient sounds and clear queue.
      if (soundsName === this.loadingSounds_) {
        for (var i = 0; i < this.soundQueue_.length; i++) {
          // Fine to play them all. Klang appears to correctly handle running
          // even scene_start and scene_end ambient sounds back to back.
          console.log('Klang: playing queued sound ' + this.soundQueue_[i]);
          this.triggerSound_(this.soundQueue_[i]);
        }
        this.loadingSounds_ = null;
        this.soundQueue_ = [];
      }
    }.bind(this),
    function progress() {
      // for now, we don't care about this
    },
    function failure() {
      console.warn('Klang failed to load ' + soundsName);
      if (soundsName === this.loadingSounds_) {
        this.loadingSounds_ = null;
        this.soundQueue_ = [];
      }
    }.bind(this));
};

/**
 * Play a Klang ambient-sound "script" based on a`sound-ambient` event.
 * Ambient sounds include the soundtrack and any environmental noises that are
 * scripted in a sequence inside of Klang's config file.
 * @param {{detail: SoundController.SoundDetail}} loadEvent
 */
SoundController.prototype.playAmbientSounds = function(loadEvent) {
  // ambient sounds are important, so queue them up if the last load (or loading
  // Klang itself) hasn't finished yet
  if (!this.klangLoaded_ || this.loadingSounds_) {
    this.soundQueue_.push(loadEvent.detail);
  } else {
    console.log('Klang: playing sound ' + loadEvent.detail);
    this.triggerSound_(loadEvent.detail);
  }
};

/**
 * Play a transient sound based on a `sound-trigger` event. Transient sounds are
 * sounds like an on-click sound, or a missed-objective sound in a game.
 * @param {{detail: SoundController.SoundDetail}} loadEvent
 */
SoundController.prototype.playSound = function(loadEvent) {
  // transient sounds aren't important, so attempt to play if Klang itself is
  // loaded, even if the scene's sounds are not. Some sounds are shared between
  // scenes, so it's possible it's already loaded, and if not, this particular
  // sound event likely won't be relevant by the time it is loaded.
  if (this.klangLoaded_) {
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
  var soundName = typeof sound === 'string' ? sound : sound.name;
  var args = [soundName];

  if (sound.args && Array.isArray(sound.args)) {
    [].push.apply(args, sound.args);
  }

  Klang.triggerEvent.apply(Klang, args);
};
