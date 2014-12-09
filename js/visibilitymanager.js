// TODO(bckenny): this should really be called "PauseManager" and use native
// CustomEvents

/**
 * @constructor
 */
function VisibilityManager() {
  /**
   * A stack for paused states. Zero means the current module should run.
   * Multiple parts of the app may request that the current module be paused.
   * For example, if the window is hidden *and* the main navigation is open,
   * when the window comes back to visible and the main menu is sitll open, the
   * module should remain paused, but one of the locks on the pause state will
   * be released.
   * @private {number}
   */
  this.locks_ = 0;

  /**
   * A secondary stack of paused states for iframes contained within the app, if
   * any. Ignored if the app is running, but added to the app's pause count
   * if paused. A total of zero means the app should run, non-zero and it should
   * be paused. Always non-positive.
   * @private {number}
   */
  this.iframeLocks_ = 0;

  window.addEventListener('blur', this.pause.bind(this));
  window.addEventListener('focus', this.resume.bind(this));
  document.addEventListener('visibilitychange', function onVisibilityChange(e) {
    document.hidden ? this.pause() : this.resume();
  }.bind(this));
}

/**
 * @param {!Function} callback
 */
VisibilityManager.prototype.addOnPauseListener = function(callback) {
  Events.addListener(this, 'pause', callback);
};

/**
 * @param {!Function} callback
 */
VisibilityManager.prototype.addOnResumeListener = function(callback) {
  Events.addListener(this, 'resume', callback);
};

/**
 * Ensure the page is paused.
 */
VisibilityManager.prototype.pause = function() {
  if (this.locks_ +  this.iframeLocks_ === 0) {
    Events.trigger(this, 'pause');
  }
  this.locks_++;
  window.console.log('pause', this.locks_, this.iframeLocks_);
};

/**
 * Signal that an iframe has paused, possibly pausing the app.
 */
VisibilityManager.prototype.pauseIframe = function() {
  // if state is changing and it was running, signal paused
  var iframeLocks = Math.min(0, this.iframeLocks_ + 1);
  if (iframeLocks !== this.iframeLocks_ && (this.locks_ + this.iframeLocks_ === 0)) {
    Events.trigger(this, 'pause');
  }
  this.iframeLocks_ = iframeLocks;
  window.console.log('iframe pause', this.locks_, this.iframeLocks_);
};

/**
 * Try to resume. Another part of the app may have also requested a pause.
 */
VisibilityManager.prototype.resume = function() {
  // if state is changing and is now unpaused, signal resumed
  var locks = Math.max(0, this.locks_ - 1);
  if (locks !== this.locks_ && (locks + this.iframeLocks_ === 0)) {
    Events.trigger(this, 'resume');
  }
  this.locks_ = locks;
  window.console.log('resume', this.locks_, this.iframeLocks_);
};

/**
 * Signal that an iframe has resumed, possibly resuming the app.
 */
VisibilityManager.prototype.resumeIframe = function() {
  this.iframeLocks_--;
  if (this.locks_ + this.iframeLocks_ === 0) {
    Events.trigger(this, 'resume');
  }
  window.console.log('iframe resume', this.locks_, this.iframeLocks_);
};

/**
 * @return {boolean}
 */
VisibilityManager.prototype.isPaused = function() {
  return !!(this.locks_ + this.iframeLocks_);
};
