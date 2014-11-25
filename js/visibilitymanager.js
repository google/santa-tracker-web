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

  window.addEventListener('blur', function() {
    window.santaApp.fire('sound-ambient', 'global_blur');
    
    this.pause();
  }.bind(this));

  window.addEventListener('focus', function() {
    window.santaApp.fire('sound-ambient', 'global_focus');
    this.resume();
  }.bind(this));

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
  if (!this.locks_) {
    Events.trigger(this, 'pause');
    // window.santatracker.setPaused(true);
    window.santaApp.fire('sound-ambient', 'global_pause');
  }
  this.locks_++;
  window.console.log('pause', this.locks_);
};

/**
 * Try to resume. Another part of the app may have also requested a pause.
 */
VisibilityManager.prototype.resume = function() {
  // The user may have loaded the page while it was hidden.
  this.locks_ = Math.max(0, this.locks_ - 1);
  if (!this.locks_) {
    Events.trigger(this, 'resume');
    // window.santatracker.setPaused(false);
    window.santaApp.fire('sound-ambient', 'global_unpause');
  }
  window.console.log('resume', this.locks_);
};

/**
 * @return {boolean}
 */
VisibilityManager.prototype.isPaused = function() {
  return !!this.locks_;
};
