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

goog.provide('app.Clock');

goog.require('app.Constants');
goog.require('app.shared.utils');

/**
 * Clock class for handling an individual clock animation.
 *
 * @param {!Element} context Module context in a HTML element
 * @constructor
 */
app.Clock = function(context) {
  this.$context_ = $(context);
  this.context_ = this.$context_[0];
  this.$secondsPointer = this.$context_.find('.js-clock-pointer-seconds');
  this.$minutesPointer = this.$context_.find('.js-clock-pointer-minutes');
  this.$hourPointer = this.$context_.find('.js-clock-pointer-hour');

  this.onClockClick_ = this.onClockClick_.bind(this);

  this.secondsPlayer_ = (function(el) {
    var steps = [
      {transform: 'rotate(0deg)'},
      {transform: 'rotate(360deg)'}
    ];
    return el.animate(steps, {duration: 60 * 1000, iterations: Infinity});
  }(this.$secondsPointer.get(0)));
};

/**
 * Initializes the class.
 */
app.Clock.prototype.init = function() {
  this.addEventListeners_();
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.Clock.prototype.destroy = function() {
  this.removeEventListeners_();
  this.secondsPlayer_.cancel();
};

/**
 * Binds event listeners to some elements.
 * @private
 */
app.Clock.prototype.addEventListeners_ = function() {
  this.$context_.on('click', this.onClockClick_);
};

/**
 * Un-binds event listeners to some elements.
 * @private
 */
app.Clock.prototype.removeEventListeners_ = function() {
  this.$context_.off('click', this.onClockClick_);
};

/**
 * Animates the hour, seconds and minutes pointer in the clock.
 * @private
 */
app.Clock.prototype.spinPointers_ = function() {

  var secondsEl = this.$secondsPointer.get(0);
  var secondsTransform = app.shared.utils.computedTransform(secondsEl);
  secondsEl.animate([
    {transform: 'rotate(' + secondsTransform.rotate + 'deg)'},
    {transform: 'rotate(' + (secondsTransform.rotate + (360 * 2.5)) + 'deg)'}
  ], {duration: 1250, easing: 'ease-out'});

  // Offset the background animation by the interactive animation's length: at
  // 1.25 seconds back (animation time) plus 30 seconds (half offset).
  this.secondsPlayer_.currentTime += (-1.25 + 30) * 1000;

  var sharedTiming = {duration: 500, easing: 'ease-out'};

  var hourEl = this.$hourPointer.get(0);
  var hourTransform = app.shared.utils.computedTransform(hourEl);
  var hourFinal = 'rotate(' + (hourTransform.rotate + 30) + 'deg)';
  var hourAnim = hourEl.animate([
    {transform: 'rotate(' + hourTransform.rotate + 'deg)'},
    {transform: hourFinal}
  ], sharedTiming);
  app.shared.utils.onWebAnimationFinished(hourAnim, function() {
    hourEl.style.webkitTransform = hourFinal;
    hourEl.style.transform = hourFinal;
  });

  var minutesEl = this.$minutesPointer.get(0);
  var minutesTransform = app.shared.utils.computedTransform(minutesEl);
  var minutesFinal = 'rotate(' + (minutesTransform.rotate + 390) + 'deg)';
  var minutesAnim = minutesEl.animate([
    {transform: 'rotate(' + minutesTransform.rotate + 'deg)'},
    {transform: minutesFinal}
  ], sharedTiming);
  app.shared.utils.onWebAnimationFinished(minutesAnim, function() {
    minutesEl.style.webkitTransform = minutesFinal;
    minutesEl.style.transform = minutesFinal;
  });

};

/**
 * Callback for when a clock is actually clicked.
 * @private
 */
app.Clock.prototype.onClockClick_ = function() {
  this.spinPointers_();
};

