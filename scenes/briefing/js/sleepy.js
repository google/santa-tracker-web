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

goog.provide('app.Sleepy');

goog.require('app.Constants');
goog.require('app.shared.utils');

/**
 *
 * Sleepy class responsible for the sleepy elements (elves).
 *
 * @param {!Element} context An DOM element which wraps the scene.
 * @param {!app.DelayPool} delayPool reference to the delayPool.
 * @param {!app.SleepyController} sleepyController reference to the sleepy controller.
 * @constructor
 */
app.Sleepy = function(context, delayPool, sleepyController) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];
  this.$head = this.$context_.find('.js-spectator-head');
  this.$headVerticalStep1 = this.$context_.find('.js-spectator-head-vertical-1');
  this.$headVerticalStep2 = this.$context_.find('.js-spectator-head-vertical-2');
  this.$headVerticalFinal = this.$context_.find('.js-spectator-head-vertical-3');
  this.$letters = this.$context_.find('.js-letters');
  this.CSS_SLEEPING_CLASS = 'is-sleeping';
  this.CSS_BOUNCING_CLASS = 'is-bouncing';
  this.isSleeping = false;
  this.sleepingTimer_ = -1;
  this.sleepingKeyframesTimer_ = -1;
  this.bouncingKeyframesTimer_ = -1;
  this.scheduleSleepingTimer_ = -1;
  this.headRotateZPlayer = null;
  this.headRotateYPlayer = null;
  this.sleepingVertically = true;
  this.delayPool = delayPool;
  this.sleepyController = sleepyController;

  this.onSleepyClick_ = this.onSleepyClick_.bind(this);
};

/**
 * Initializes the class.
 */
app.Sleepy.prototype.init = function() {
  this.scheduleSleep_();
  this.addEventListeners_();
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.Sleepy.prototype.destroy = function() {
  this.removeEventListeners_();
  this.randomDelayPool = null;
  window.clearTimeout(this.sleepingKeyframesTimer_);
  window.clearTimeout(this.sleepingTimer_);
  window.clearTimeout(this.bouncingKeyframesTimer_);
  window.clearTimeout(this.scheduleSleepingTimer_);
  this.isSleeping = false;
};

/**
 * Binds event listeners to some elements.
 *
 * @private
 */
app.Sleepy.prototype.addEventListeners_ = function() {
  this.$context_.on('click', this.onSleepyClick_);
};

/**
 * Un-binds event listeners to some elements.
 *
 * @private
 */
app.Sleepy.prototype.removeEventListeners_ = function() {
  this.$context_.off('click', this.onSleepyClick_);
};

/**
 * Sets a timeout to start sleeping.
 *
 * @private
 */
app.Sleepy.prototype.scheduleSleep_ = function() {
  var randomDelay = this.delayPool.getRandomDelay_();
  this.sleepingTimer_ = window.setTimeout(this.tryToSleep_.bind(this), randomDelay);
};

/**
 * Makes a character have the sleepy state.
 *
 * @private
 */
app.Sleepy.prototype.tryToSleep_ = function() {
  if (!this.sleepyController.canSleep()) {
    // try again
    this.scheduleSleep_();
    return;
  }

  this.chooseSleepingMode_();
  if (this.sleepingVertically) {
    this.tweenRotateYHead_();
  } else {
    this.tweenRotateZHead_();
  }

  this.sleepingKeyframesTimer_ = window.setTimeout(this.startSleepingKeyframes_.bind(this), 50);
  this.isSleeping = true;
  this.sleepyController.addSleepy();

  window.santaApp.fire('sound-trigger', 'briefing_snore');
};

/**
 * Wakes up a character by reversing the sleeping (if possible)
 * and re-scheduling the next sleepy cycle.
 *
 * @private
 */
app.Sleepy.prototype.wakeUp_ = function() {

  this.stopSleepingKeyframes_();

  if (this.headRotateYPlayer !== null) {
    this.headRotateYPlayer.playbackRate = -1.5;
    this.headRotateYPlayer.play();
    this.headRotateYPlayer = null;
  }

  if (this.headRotateZPlayer !== null) {
    this.headRotateZPlayer.playbackRate = -2.5;
    this.headRotateZPlayer.play();
    this.headRotateZPlayer = null;
  }

  window.santaApp.fire('sound-trigger', 'briefing_wakeup');

  window.clearTimeout(this.sleepingKeyframesTimer_);
  window.clearTimeout(this.sleepingTimer_);
  window.clearTimeout(this.bouncingKeyframesTimer_);
  this.isSleeping = false;
  this.sleepyController.subtractSleepy();
  this.scheduleSleepingTimer_ = window.setTimeout(this.scheduleSleep_.bind(this), 3000);
};

/**
 * Sleeping mode can be 0 or 1.
 *
 * @private
 */
app.Sleepy.prototype.chooseSleepingMode_ = function() {
  this.sleepingVertically = (Math.random() > 0.5);
};

/**
 * Add CSS animation classes to the character
 * that visualises it's sleeping state.
 *
 * @private
 */
app.Sleepy.prototype.startSleepingKeyframes_ = function() {
  this.$letters.addClass(this.CSS_SLEEPING_CLASS);

  this.bouncingKeyframesTimer_ = window.setTimeout(function() {
    if (this.sleepingVertically) {
      this.$headVerticalFinal.addClass(this.CSS_BOUNCING_CLASS);
    } else {
      this.$head.addClass(this.CSS_BOUNCING_CLASS);
    }
  }.bind(this), 3000);
};

/**
 * Removes CSS animation classes from the character
 * that visualises it's awaking state.
 *
 * @private
 */
app.Sleepy.prototype.stopSleepingKeyframes_ = function() {
  this.$letters.removeClass(this.CSS_SLEEPING_CLASS);
  this.$headVerticalFinal.removeClass(this.CSS_BOUNCING_CLASS);
  this.$head.removeClass(this.CSS_BOUNCING_CLASS);
};

/**
 * Performs a timeline of display steps
 * to show the head flipping backwards.
 *
 * @private
 */
app.Sleepy.prototype.tweenRotateYHead_ = function() {
  var duration = 70;

  var steps = [
    new KeyframeEffect(this.$head.get(0), [
      {visibility: 'visible'},
      {visibility: 'hidden'}
    ], {duration: duration, fill: 'forwards'}),
    new KeyframeEffect(this.$headVerticalStep1.get(0), [
      {visibility: 'visible'},
      {visibility: 'hidden'}
    ], {duration: duration}),
    new KeyframeEffect(this.$headVerticalStep2.get(0), [
      {visibility: 'visible'},
      {visibility: 'hidden'}
    ], {duration: duration}),
    new KeyframeEffect(this.$headVerticalFinal.get(0), [
      {visibility: 'visible'},
      {visibility: 'visible'}
    ], {duration: duration, fill: 'forwards'}),
  ];

  this.headRotateYPlayer = document.timeline.play(new SequenceEffect(steps, {fill: 'forwards'}));
};

/**
 * Tweens the head rotating when not sleeping vertically.
 *
 * @private
 */
app.Sleepy.prototype.tweenRotateZHead_ = function() {
  var el = this.$head.get(0);

  var steps = [
    {transform: 'rotate(0deg)', easing: 'ease-out'},
    {transform: 'rotate(70deg)'}
  ];

  this.headRotateZPlayer = el.animate(steps, { duration: 2000, fill: 'forwards' });
};

/**
 * Callback for when a chair clicked
 */
app.Sleepy.prototype.onSleepyClick_ = function() {
  if (this.isSleeping) {
    // give it some time to react to look more organic
    window.setTimeout(this.wakeUp_.bind(this), 200);
  }
};
