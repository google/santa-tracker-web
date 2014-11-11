/**
 * Analytics for Santa Tracker
 *
 * @constructor
 */
function Analytics() {
  this.init();
}

Analytics.prototype.THROTTLE_TIME_ = 10; // 10ms

Analytics.prototype.init = function() {
  if (this.ga_) {
    return;
  }

  var domain = document.domain.replace(/www\./, '');

  var ga = this.ga_ = new gweb.analytics.AutoTrack({
    'profile': window['DEV'] ? 'UA-37048309-2' : 'UA-37048309-1',
    'trackClicks': false,
    'disableTrackPageview': true
  });

  var client = getUrlParameter('embed_client');
  if (client) {
    ga.pushCommand(['set', 'campaignSource', client]);
    ga.pushCommand(['set', 'campaignMedium', 'embed']);
  }
  if (getUrlParameter('api_client') == 'web_chromecast') {
    ga.pushCommand(['set', 'campaignSource', 'chromecast']);
    ga.pushCommand(['set', 'campaignMedium', 'chromecast']);
  }
};

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
