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

goog.provide('app.Background');



/**
 * Manages the dynamic background color and level transitions.
 * @param {!jQuery} els contains two elements, current and next level background divs.
 * @constructor
 */
app.Background = function(els) {
  this.currentEl = els.eq(0);
  this.nextEl = els.eq(1);
  this.transitionLevel = 0;
  this.transitionProgress = null;

  this.reset();
};


/**
 * Height of app.Backgrounds in percentages relative to the
 * window innerHeight.
 * @type {number}
 * @const
 */
app.Background.BACKGROUND_HEIGHT = 150;


/**
 * How long should it take to transition between levels?
 * @type {number}
 * @const
 */
app.Background.TRANSITION_DURATION = 5;


/**
 * Resets the app.Backgrounds for a new game.
 */
app.Background.prototype.reset = function() {
  this.transitionLevel = 0;

  this.nextEl.attr('class', 'background background--0');
  this.endTransition_();
};


/**
 * Starts a new level transition.
 */
app.Background.prototype.transition = function() {
  this.transitionProgress = 0;
};


/**
 * Cleans up after a transition and prepares for the next transition.
 * @private
 */
app.Background.prototype.endTransition_ = function() {
  this.transitionProgress = null;
  this.transitionLevel++;

  var nextEl = this.currentEl;
  this.currentEl = this.nextEl;
  this.nextEl = nextEl;

  this.currentEl.css({
    transform: 'translateZ(0)',
    zIndex: 0
  });
  this.nextEl.css({
    transform: 'translate3d(0, -100%, 0)',
    zIndex: 1
  });

  // Prepare next level right away to push paint lag until after transition.
  this.nextEl.attr('class',
      'background background--' + this.transitionLevel);
};


/**
 * Updates the background by a specific time delta.
 * @param {number} delta seconds since last frame.
 */
app.Background.prototype.onFrame = function(delta) {
  if (this.transitionProgress == null) {
    return;
  }

  this.transitionProgress += delta / app.Background.TRANSITION_DURATION;
  if (this.transitionProgress > 1) {
    this.endTransition_();
    return;
  }

  var yPercentage = -100 + this.transitionProgress * 100;
  this.nextEl.css('transform', 'translate3d(0, ' + yPercentage + '%, 0)');
};
