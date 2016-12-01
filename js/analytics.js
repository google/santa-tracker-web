/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

goog.provide('Analytics');

/**
 * Analytics for Santa Tracker
 *
 * @constructor
 * @struct
 * @export
 */
Analytics = function Analytics() {
  /**
   * A collection of timing categories, each a collection of start times.
   * @private {!Object<string, Object<string, ?number>>}
   */
  this.startTimes_ = {};
}

Analytics.prototype.THROTTLE_TIME_ = 10; // 10ms

/**
 * Stores a start time associated with a category and variable name. When an
 * end time is registered with matching variables, the time difference is
 * sent to analytics. Use unique names if a race condition between timings is
 * possible; if a start time with the same names is registerd without an end
 * time in between, the original start time is discarded.
 * @param {string} category Category of timing (e.g. 'Assets load time')
 * @param {string} variable Name of the timing (e.g. 'polymer-ready')
 * @param {number} timeStart A timestamp associated with start, in ms.
 * @export
 */
Analytics.prototype.timeStart = function(category, variable, timeStart) {
  const categoryTimes = this.startTimes_[category] || (this.startTimes_[category] = {});
  categoryTimes[variable] = timeStart;
};

/**
 * Ends a timing event. The difference between the time associated with this
 * event and the timeStart event with the matching category and variable names
 * is sent to analytics. If no match can be found, the time is discarded.
 * @param {string} category Category of timing (e.g. 'Assets load time')
 * @param {string} variable Name of the timing (e.g. 'polymer-ready')
 * @param {number} timeEnd A timestamp associated with end, in ms.
 * @param {string=} opt_label An optional sublabel, for e.g. A/B test identification.
 * @export
 */
Analytics.prototype.timeEnd = function(category, variable, timeEnd, opt_label) {
  const categoryTimes = this.startTimes_[category];
  if (!categoryTimes) {
    return;
  }
  const timeStart = categoryTimes[variable];
  if (timeStart != null) {
    const time = timeEnd - timeStart;
    window.ga('send', 'timing', category, variable, Math.round(time), opt_label);
    categoryTimes[variable] = null;
  }
};

/**
 * Tracks an event
 *
 * @param {string} category
 * @param {string} action
 * @param {string=} opt_label
 * @param {number=} opt_value
 * @export
 */
Analytics.prototype.trackEvent = function(category, action, opt_label, opt_value) {
  window.ga('send', 'event', category, action, opt_label || '(not set)', opt_value);
};

/**
 * Tracks that a game has started.
 * @param {string} gameId module id.
 * @export
 */
Analytics.prototype.trackGameStart = function(gameId) {
  this.trackEvent('game', 'start', gameId);
};

/**
 * Tracks that the user quit the game before finishing it.
 * @param {string} gameId module id.
 * @param {number} level
 * @param {number} timePlayed milliseconds played.
 * @export
 */
Analytics.prototype.trackGameQuit = function(gameId, level, timePlayed) {
  this.trackEvent('game', 'quit', gameId, Math.floor(timePlayed / 1000));
  this.trackEvent('game', 'level', gameId, level);
};

/**
 * Tracks when a game has completed (i.e. the user lost the game).
 * @param {string} gameId module id.
 * @param {number} score
 * @param {number} level
 * @param {number} timePlayed milliseconds played.
 * @export
 */
Analytics.prototype.trackGameOver = function(gameId, score, level, timePlayed) {
  this.trackEvent('game', 'end', gameId);
  this.trackEvent('game', 'timePlayed', gameId, Math.floor(timePlayed / 1000));
  this.trackEvent('game', 'score', gameId, score);
  this.trackEvent('game', 'level', gameId, level);
};
