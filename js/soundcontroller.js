/* global Klang */

function SoundController() {
  // load Klang
  var klangScript = document.createElement('script');
  klangScript.src = SoundController.klangSrc_;

  klangScript.addEventListener('load', this.onLoad_.bind(this));
  document.getElementsByTagName('head')[0].appendChild(klangScript);

  this.soundQueue_ = [];

  this.klangLoaded_ = false;
}

// TODO(bckenny): update these for production
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

SoundController.prototype.onLoad_ = function() {
  // load config script
  debugger;
  Klang.init(SoundController.klangConfigSrc_, function(success) {
    if (success) {
      console.log('Klang loaded');
    } else {
      console.log('Klang failed to load');
    }
  }, function(percent) {
    console.log('Klang ' + percent + '% loaded');
  });
};

SoundController.prototype.loadSoundSet = function(setName) {

};

SoundController.prototype.playSoundScript = function(scriptName) {

};

SoundController.prototype.playSound = function(soundName) {

};
