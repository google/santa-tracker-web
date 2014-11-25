/* globals swfobject */

/**
 * Manages a video playback scene.
 * @param {Element} dom node
 * @constructor
 */
function VideoPlayer(div, moduleName, videoId) {
  this.videoId = videoId;
  this.moduleName = moduleName;
  this.elem = $(div);
  this.playerWrapper = this.elem.find('.player-wrapper');
  this.trackerElem = this.elem.find('.tracker');
  this.pauseButton = this.elem.find('.pause');
  this.player = null;
  this.updateInterval_ = null;
  this.isPreloading = null;
  this.hasStartedPlayback = false;

  // Mobile browsers have less features in the youtube api, f.ex. need a user event to
  // start video playback. This check will have to do...
  this.isMobile = Modernizr.touch;
  this.isIPhone = navigator.userAgent.match(/iPhone OS\s+/);

  this.embedPlayer_();
  this.registerEvents_();

  window.santaApp.fire('sound-ambient', 'videoplayer_start');
}

VideoPlayer.prototype.isPaused = function() {
  if (!this.player || !this.player.getPlayerState) return true;
  var state = this.player.getPlayerState();
  return !(state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING);
};

/**
 * Registers events for the video player.
 * @private
 */
VideoPlayer.prototype.registerEvents_ = function() {
  var that = this;
  this.pauseButton.on('click', function() {
    if (that.isPaused()) {
      that.player.playVideo();
    } else {
      that.player.pauseVideo();
    }
  });

  this.elem.find('.restart').on('click', function() {
    that.player.seekTo(0);
    that.player.playVideo();
  });

  // Resize the player as needed.
  if (this.isIPhone) {
    this.playerWrapper.addClass('iphone');
  } else {
    $(window).on('resize.videoplayer', this.coverPlayer_.bind(this));
    this.coverPlayer_();
  }
};

/**
 * Creates the video object.
 * @private
 */
VideoPlayer.prototype.embedPlayer_ = function() {
  this.player = new YT.Player('module-' + this.moduleName + '-player', {
    height: '100%',
    width: '100%',
    videoId: this.videoId,
    playerVars: {
      controls: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0
    },
    events: {
      'onReady': this.onYouTubeReady_.bind(this),
      'onStateChange': this.stateChanged_.bind(this)
    }
  });
};

/**
 * Handler for when the flash player has started.
 * @private
 */
VideoPlayer.prototype.onYouTubeReady_ = function(elemId) {
  if (!this.isMobile) {
    // Hack to preload video. Mute, play, then pause when it's started.
    this.isPreloading = true;
    this.player.mute();
    this.player.playVideo();
  }
  startButton(this.elem, this.playVideo_.bind(this));
};

/**
 * Event handler when playback state changes.
 * @param state
 * @private
 */
VideoPlayer.prototype.stateChanged_ = function(state) {
  var playing = state.data === YT.PlayerState.PLAYING;
  this.pauseButton.toggleClass('paused', !playing);

  // Check if we just finished preloading.
  if (this.isPreloading && playing) {
    this.isPreloading = false;
    this.player.pauseVideo();
  }

  if (!this.hasStartedPlayback) {
    this.hasStartedPlayback = true;

    // This shrinkwrap disables any default behaviour on the youtube
    // player, like pausing on desktop and fixes a play-pause bug on
    // ipad.
    this.elem.find('.player-shrinkwrap').show();

    // On mobile we let the iframe handle user events and hide the poster
    // when it's starting.
    if (this.isMobile) {
      this.switchToVideo_();
    }
  }

  // Is the video over?
  if (state.data === YT.PlayerState.ENDED) {
    this.switchToPoster_();
  }
};

/**
 * Starts the video playback. Called when play button is clicked, only
 * on desktop.
 * @private
 */
VideoPlayer.prototype.playVideo_ = function() {
  // Stop preloading.
  if (!window.santatracker.muteState.isMuted()) {
    this.player.unMute();
  }
  this.isPreloading = false;

  // Now start!
  this.player.playVideo();

  this.switchToVideo_();

  // Keep the player controls up to date.
  this.updateInterval_ = setInterval(this.updatePlayerInfo_.bind(this), 250);
  this.updatePlayerInfo_();
};

/**
 * Switches to video playback mode.
 * @private
 */
VideoPlayer.prototype.switchToVideo_ = function() {
  // Remove overlay and add player controls.
  this.elem.find('.poster').hide();
  this.elem.find('.videoboard').removeClass('hidden');

  // On mobile the start button we remove the start button here since
  // the user is actually pressing the native video player underneath.
  this.elem.find('.start').remove();
};

/**
 * Switches to poster so user can start again.
 * @private
 */
VideoPlayer.prototype.switchToPoster_ = function() {
  // Remove overlay and add player controls.
  this.elem.find('.poster').show();
  this.elem.find('.player-shrinkwrap').hide();
  this.elem.find('.videoboard').removeClass('hidden');

  // Dispose the player.
  this.player.destroy();
  this.player = null;
  $('<div>').attr('id', 'module-' + this.moduleName + '-player').appendTo(this.playerWrapper);

  clearInterval(this.updateInterval_);
  this.hasStartedPlayback = false;
  this.embedPlayer_();
};

/**
 * Periodically updates playback state.
 * @private
 */
VideoPlayer.prototype.updatePlayerInfo_ = function() {
  var duration = this.player.getDuration();
  var seconds = this.player.getCurrentTime();

  // Update track position
  var donePercent = seconds / duration;
  var trackX = donePercent * 150;
  trackX = Math.min(trackX, 150);
  this.trackerElem.css('transform', 'translate3d(' + trackX + 'px, 0, 0)');

  seconds = Math.floor(seconds);
  var text = '' + Math.floor(seconds / 60) + ':' + pad_(seconds % 60);
  this.trackerElem[0].textContent = text;
};

/**
 * Remote controllability.
 */
VideoPlayer.prototype.togglePause = function(paused) {
  if (this.player) {
    if (paused) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }
  }
};

/**
 * Sets player size to always
 * @private
 */
VideoPlayer.prototype.coverPlayer_ = function() {
  if (!this.player) { return; }

  var screenWidth = this.elem.width(),
    screenHeight = this.elem.height(),
    ratio = 16 / 9,
    width, height, top, left;

  if (screenWidth < screenHeight * ratio) {
    height = screenHeight;
    width = screenHeight * ratio;
  } else {
    width = screenWidth;
    height = screenWidth / ratio;
  }

  top = screenHeight / 2 - height / 2;
  left = screenWidth / 2 - width / 2;

  this.playerWrapper.css({
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px'
  });
};

/**
 * Disposes the player when the module is hidden.
 */
VideoPlayer.prototype.dispose = function() {
  clearInterval(this.updateInterval_);
  window.santaApp.fire('sound-ambient', 'videoplayer_end');
};

/**
 * A helper that zero-pads a number to 2 digits. F.ex. 5 becomes "05".
 * @param {number} num The number to pad.
 * @return {string} Zero padded number.
 * @private
 */
var pad_ = function(num) {
  return (num < 10 ? '0' : '') + num;
};
