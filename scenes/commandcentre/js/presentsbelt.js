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

goog.require('app.Constants');
goog.require('app.PresentPool');

goog.provide('app.PresentsBelt');



/**
 * Class for belt with presents dropping of the edge
 * @param {!Element} domEl DOM element containing the belt
 * @param {object} options Configuration options for the belt
 * @constructor
 */
app.PresentsBelt = function(domEl, options) {
  this.$el = $(domEl);
  this.options = options || {};
  this.options.timeOffset = this.options.timeOffset || 0;
  this.options.direction = this.options.direction || 'ltr';
  this.$presentEls = this.$el.find('.presents-screen__belt__present');

  this.distance_ = this.$el.width();
  this.dx_ = app.Constants.PRESENTS_BELT_DURATION / this.distance_;

  this.presentPool = new app.PresentPool(this.$presentEls);

  this.init_();
};

app.PresentsBelt.prototype = {

  /**
   * Callback when present is added to timeline
   * @param {!app.Present} present added
   * @private
   */
  onEnterBelt_: function(present) {
    present.onEnterBelt();
    // add next present unless first setup
    if (!this.setup) {
      this.addItem_();
    }
  },

  /**
   * Callback when present reaches end of timeline
   * @param {!app.Present} present to remove
   * @param {!AnimationPlayer} player to remove from timeline
   * @private
   */
  onExitBelt_: function(present, player) {
    this.timeline.remove(player);
    present.onExitBelt();
  },

  /**
   * Return length of present (including margin to next present) as duration of seconds
   * @param {!app.Present} present added
   * @private
   * @return {number}
   */
  itemWidthAsSeconds_: function(present) {
    return this.dx_ * present.outerWidth();
  },

  /**
   * Generate a random rotation angle based on app constants min/max
   * @private
   * @return {number}
   */
  getRandomDropRotation_: function() {
    var c = app.Constants;
    var max = c.PRESENTS_DROP_ROTATION_MAX - c.PRESENTS_DROP_ROTATION_MIN + 1;
    var min = c.PRESENTS_DROP_ROTATION_MIN;
    return Math.floor(Math.random() * max + min);
  },

  /**
   * Schedule present tweens on the timeline
   * @param {!app.Present} present added
   * @param {number} startTime to start at, in seconds
   * @private
   */
  scheduleItem_: function(present, startTime) {
    var directionMultiplier = this.options.direction === 'ltr' ? 1 : -1;
    var presentMidpoint = present.width() * 0.5;
    var startDropRotation = 35 * directionMultiplier;
    var finalDropRotation = (this.getRandomDropRotation_() + 35) * directionMultiplier;

    var endOfBeltX = directionMultiplier * this.distance_ - presentMidpoint;
    var presentBagX = endOfBeltX + 90 * directionMultiplier;

    // all values in seconds
    var rotationTime = startTime + app.Constants.PRESENTS_BELT_DURATION;
    var dropTime = rotationTime + app.Constants.PRESENTS_ROTATION_DURATION;
    var endTime = dropTime + app.Constants.PRESENTS_DROP_DURATION;
    var duration = endTime - startTime;

    var beltSteps = [
      {
        transform: 'translate(0px, 0px)'
      },
      {
        transform: 'translate(' + endOfBeltX + 'px, 0px)',
        offset: (rotationTime - startTime) / duration
      },
      {
        transform: 'translate(' + endOfBeltX + 'px, 0px) rotate(' + startDropRotation + 'deg)',
        offset: (dropTime - startTime) / duration,
        easing: 'ease-in'
      },
      {
        transform: 'translate(' + presentBagX + 'px, 100px) rotate(' + finalDropRotation + 'deg)'
      },
    ];

    var presentEl = present.$el.get(0);
    var player = this.timeline.schedule(startTime * 1000, presentEl, beltSteps, duration * 1000);

    this.timeline.call(startTime * 1000, this.onEnterBelt_.bind(this, present));
    this.timeline.call(dropTime * 1000, function() {
      window.santaApp.fire('sound-trigger', 'command_presentdrop');
    });
    this.timeline.call(endTime * 1000, this.onExitBelt_.bind(this, present, player));
  },

  /**
   * Add a Present to animate across the belt
   * @private
   * @return {app.Present}
   */
  addItem_: function(startTime) {
    var startTime = startTime || this.timeline.currentTime / 1000;

    var present = this.presentPool.getFreeItem();
    if (present) {
      startTime += this.itemWidthAsSeconds_(present); // delay based on width of present
      this.scheduleItem_(present, startTime);
    } else {
      // pool size and margin between items must be set so we don't run out of items in the pool
      console.log('NO FREE present IN POOL');
    }

    return present;
  },

  /**
   * Setup belt on load
   * @private
   */
  init_: function() {
    this.timeline = new FauxTimeline();

    this.setup = true;
    var seekTime = 1;
    for (var j = 0; j < app.Constants.PRESENTS_PRELOAD_AMOUNT; j++) {
      var present = this.addItem_(seekTime);
      seekTime += this.itemWidthAsSeconds_(present);
    }

    // start 1 second before to be sure we trigger callbacks for last present
    this.timeline.seek((seekTime - 1 + this.options.timeOffset) * 1000);
    this.setup = false;
  },

  /**
   * Destroy belt and all scheduled animations
   */
  destroy: function() {
    this.timeline.remove();
    this.presentPool = null;
  }

};
