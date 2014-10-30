/* global Klang */

/**
 * @constructor
 * @struct
 */
function SoundController() {
  // load Klang
  var klangScript = document.createElement('script');
  klangScript.src = SoundController.klangSrc_;

  klangScript.addEventListener('load', this.loadKlangConfig_.bind(this));
  document.getElementsByTagName('head')[0].appendChild(klangScript);

  /**
   * A queue of the sounds to load as soon as Klang is ready to go.
   * @private {Array<string>}
   */
  this.loadQueue_ = [];

  /**
   * A queue of the sounds to play as soon as the currently loading sounds
   * finish downloading.
   * @private {Array<string>}
   */
  this.soundQueue_ = [];

  /**
   * Whether Klang has finished loading.
   * @private {boolean}
   */
  this.klangLoaded_ = false;

  /**
   * Whether sounds are currently loading so sound triggers should be queued.
   * @private {boolean}
   */
  this.loadingSounds_ = false;
}

// TODO(bckenny): update these URLs for production
/**
 * Klang script source URL.
 * @private {string}
 */
SoundController.klangSrc_ = 'js/third_party/klang/klang.js';

// TODO(bckenny): really should just inline config.json to load all at once.
/**
 * Klang config file URL.
 * @private {string}
 */
SoundController.klangConfigSrc_ = 'js/third_party/klang/config.json';

SoundController.prototype.loadKlangConfig_ = function() {
  // load config script
  Klang.init(SoundController.klangConfigSrc_, function(success) {
    if (success) {
      console.log('Klang loaded');
      this.klangLoaded_ = true;

    } else {
      console.log('Klang failed to load');
      // TODO(bckenny): deal with Klang load failure, if we don't inline config
    }
  }.bind(this));
};

/**
 * Load a set of sounds based on a `sound-preload` event.
 * @param {{detail: string}} loadEvent
 */
SoundController.prototype.loadSounds = function(loadEvent) {
  this.loadingSounds_ = true;

  // a new load has been triggered, so cancel any existing queued ambient sounds
  // TODO(bckenny): this appears to be the correct behavior, but it's possible
  // that loads, plays, and scenes may be less correlated than I've assumed here
  this.soundQueue_ = [];

  if (!this.klangLoaded_) {
    // sound loads predominantly only happen in onPreload, so will only be
    // called once, so if Klang has yet to load, queue them up so all will be
    // loaded.
    this.loadQueue_.push(loadEvent.detail);
    return;
  }
  
  // Klang is already loaded, so attempt to load sound files
  var soundName = loadEvent.detail;
  Klang.triggerEvent(soundName,
    function success() {
      console.log('Klang: loaded sound ' + soundName);
      // load all queued sounds
      for (var i = 0; i < this.soundQueue_.length; i++) {
        // NOTE(bckenny): Klang appears to correctly handle running even
        // scene_start and scene_end ambient sounds back to back
        console.log('Klang: playing queued sound ' + this.soundQueue_[i]);
        Klang.triggerEvent(this.soundQueue_[i]);
      }

      this.loadingSounds_ = false;
      this.soundQueue_ = [];
    }.bind(this),
    function progress() {
      // TODO(bckenny): right now, we don't care about this
    },
    function failure() {
      // TODO(bckenny): possibly retry?
      console.warn('Klang failed to load ' + soundName);
      this.loadingSounds_ = false;
      this.soundQueue_ = [];
    }.bind(this));
};

/**
 * Play a Klang ambient-sound "script" based on a`sound-ambient` event.
 * Ambient sounds include the soundtrack and any environmental noises that are
 * scripted in a sequence inside of Klang's config file.
 * @param {{detail: string}} loadEvent
 */
SoundController.prototype.playAmbientSounds = function(loadEvent) {
  // ambient sounds are important, so queue them up if the last load (or Klang
  // itself) hasn't finished yet
  if (!this.klangLoaded_ || this.loadingSounds_) {
    this.soundQueue_.push(loadEvent.detail);
  } else {
    console.log('Klang: playing sound ' + loadEvent.detail);
    Klang.triggerEvent(loadEvent.detail);
  }
};

/**
 * Play a transient sound based on a `sound-trigger` event. Transient sounds are
 * sounds like an on-click sound, or a missed-objective sound in a game.
 * @param {{detail: string}} loadEvent
 */
SoundController.prototype.playSound = function(loadEvent) {
  // transient sounds aren't important, so attempt to play if Klang itself is
  // loaded, even if the scene's sounds are not. Some sounds are shared between
  // scenes, so it's possible it's already loaded, and if not, this particular
  // sound event likely won't be relevent by the time it is loaded.
  if (this.klangLoaded_) {
    Klang.triggerEvent(loadEvent.detail);
  }
};
