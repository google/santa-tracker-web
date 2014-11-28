goog.provide('app.Scene');

goog.require('app.IframeProxy');
goog.require('app.shared.Scoreboard');

/**
 * Main game class.
 * @param {Element} el DOM element containing the scene.
 * @constructor
 * @export
 */
app.Scene = function(el) {
  this.$el = $(el);
  this.$controls = this.$el.find('.actions');
  this.$pausePlay = this.$el.find('.actions .pause');
  this.$sound = $('#sound');
  this.iframeProxy = new app.IframeProxy(this, this.$el);
  this.scoreboard = new app.shared.Scoreboard(this, this.$el.find('.board'));
  this.isPaused = false;
};

/**
 * Initialization.
 * @export
 */
app.Scene.prototype.init = function() {
  this.iframeProxy.init();
  this.attachEvents();
  this.$sound.hide();

  if (window.hasOwnProperty('santatracker') &&
    window.santatracker.hasOwnProperty('muteState') &&
    !window.santatracker.muteState.isMuted()) {
    this.mute();
  }

  if (window.hasOwnProperty('santatracker') &&
    window.santatracker.hasOwnProperty('muteState') &&
    window.santatracker.muteState.isMuted()) {
    this.unMute();
  }
};

/**
 * Destructor.
 * @export
 */
app.Scene.prototype.destroy = function() {
  this.iframeProxy.destroy();
  this.detachEvents();
  this.isPaused = null;
};

/**
 * Adds the event listeners to this module.
 */
app.Scene.prototype.attachEvents = function() {
  var _this = this;

  if (window.hasOwnProperty('santatracker') &&
    window.santatracker.hasOwnProperty('muteState')) {

    window.santatracker.muteState.addListener(function(muted) {
      if (muted) {
        _this.mute();
      } else {
        _this.unMute();
      }
    });
  }
};

/**
 * Removes the event listeners from this module.
 */
app.Scene.prototype.detachEvents = function() {
};

/**
 * Posts to the iframe to mute.
 */
app.Scene.prototype.mute = function() {
  this.iframeProxy.postMessage('mute');

};

/**
 * Posts to the iframe to unmute.
 */
app.Scene.prototype.unMute = function() {
  this.iframeProxy.postMessage('unmute');
};

/**
 * Posts to the iframe to pause or unpause
 * depending on the current state.
 */
app.Scene.prototype.togglePause = function() {
  if (this.isPaused) {
    this.iframeProxy.postMessage('play');
    this.isPaused = false;
  } else {
    this.iframeProxy.postMessage('pause');
    this.isPaused = true;
  }
};

/**
 * Posts to the iframe to restart the scene.
 */
app.Scene.prototype.restart = function() {
  this.iframeProxy.postMessage('replay');
};


//
// Callbacks from the iframe
//

/**
 * iFrame telling us the window is loaded.
 * Show the $sound control because now you can mute/unmute it.
 */
app.Scene.prototype.onLoadedMessage = function() {
  this.$sound.show();
};

/**
 * iFrame telling us to show the controls.
 */
app.Scene.prototype.onShowControlsMessage = function() {
  this.$controls.show();
};

/**
 * iFrame telling us to hide the controls.
 */
app.Scene.prototype.onHideControlsMessage = function() {
  this.$controls.hide();
};

/**
 * iFrame telling us to show the play button.
 */
app.Scene.prototype.onShowPlayMessage = function() {
  this.onHidePauseMessage();
};

/**
 * iFrame telling us to hide the play button.
 */
app.Scene.prototype.onHidePlayMessage = function() {
  this.onShowPauseMessage();
};

/**
 * iFrame telling us to show the pause button.
 */
app.Scene.prototype.onShowPauseMessage = function() {
  // paused class shows play
  this.$pausePlay.removeClass(Constants.CLASS_PAUSED);
};

/**
 * iFrame telling us to hide the pause button.
 */
app.Scene.prototype.onHidePauseMessage = function() {
  // paused class shows play
  this.$pausePlay.addClass(Constants.CLASS_PAUSED);
};

/**
 * iFrame telling us to show the mute button.
 */
app.Scene.prototype.onShowMuteMessage = function() {
};

/**
 * iFrame telling us to hide the mute button.
 */
app.Scene.prototype.onHideMuteMessage = function() {
};

/**
 * iFrame telling us to show the unmute button.
 */
app.Scene.prototype.onShowUnmuteMessage = function() {
};

/**
 * iFrame telling us to hide the unmute button.
 */
app.Scene.prototype.onHideUnmuteMessage = function() {
};
