/**
 * Analytics for Santa Tracker
 *
 * @constructor
 */
function Analytics() {
  this.ga_ = window.ga_;
}

Analytics.prototype.THROTTLE_TIME_ = 10; // 10ms

/**
 * Tracks a page view. Page view tracking is throttled to prevent logging
 * page redirects by the URL router.
 * @param {string} path
 */
Analytics.prototype.trackPageView = function(path) {
  if (this.trackTimeout_) {
    window.clearTimeout(this.trackTimeout_);
  }

  var that = this;
  this.trackTimeout_ = window.setTimeout(function() {
    that.ga_.pushCommand(['_trackPageview', path || '/']);
  }, this.THROTTLE_TIME_);
};

/**
 * Tracks a performance timing. See
 * https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingTiming#settingUp
 * @param {string} category Category of timing (e.g. 'Polymer')
 * @param {string} variable Name of the timing (e.g. 'polymer-ready')
 * @param {number} time Time, in milliseconds.
 * @param {string=} opt_label An optional sublabel, for e.g. A/B test identification.
 */
Analytics.prototype.trackPerf = function(category, variable, time, opt_label) {
  this.ga_.pushCommand(['_trackTiming', category, variable, time, opt_label]);
};

/**
 * Tracks an event
 *
 * @param {string} category
 * @param {string} action
 * @param {string=} opt_label
 * @param {(string|number)=} opt_value
 */
Analytics.prototype.trackEvent = function(category, action, opt_label, opt_value) {
  this.ga_.pushCommand(['_trackEvent', category, action, opt_label, opt_value]);
};

/**
 * Tracks a social action
 *
 * @param {string} network
 * @param {string} action
 * @param {string} target
 */
Analytics.prototype.trackSocial = function(network, action, target) {
  this.ga_.pushCommand(['_trackSocial', network, action, target]);
};

/**
 * Tracks that a game has started.
 * @param {string} gameId module id.
 */
Analytics.prototype.trackGameStart = function(gameId) {
  this.trackEvent('game', 'start', gameId);
};

/**
 * Tracks that the user quit the game before finishing it.
 * @param {string} gameId module id.
 * @param {number} timePlayed milliseconds played.
 */
Analytics.prototype.trackGameQuit = function(gameId, timePlayed) {
  this.trackEvent('game', 'quit', gameId, Math.floor(timePlayed / 1000));
};

/**
 * Tracks when a game has completed (i.e. the user lost the game).
 * @param {string} gameId module id.
 * @param {number} score
 * @param {number} level
 * @param {number} timePlayed milliseconds played.
 */
Analytics.prototype.trackGameOver = function(gameId, score, level, timePlayed) {
  this.trackEvent('game', 'end', gameId);
  this.trackEvent('game', 'timePlayed', gameId, Math.floor(timePlayed / 1000));
  this.trackEvent('game', 'score', gameId, score);
  this.trackEvent('game', 'level', gameId, level);
};
