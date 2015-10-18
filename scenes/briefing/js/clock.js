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
 * @param {!Element|!jQuery} context Module context in a HTML element
 * @constructor
 * @struct
 */
app.Clock = function(context) {
  this.context_ = app.shared.utils.unwrapElement(context);
  this.onClockClick_ = this.onClockClick_.bind(this);

  /** @const @private {!Element} */
  this.secondsPointer_ = this.context_.querySelector('.js-clock-pointer-seconds');

  /** @const @private {!Element} */
  this.minutesPointer_ = this.context_.querySelector('.js-clock-pointer-minutes');

  /** @const @private {!Element} */
  this.hourPointer_ = this.context_.querySelector('.js-clock-pointer-hour');

  /** @const @private {!Animation} */
  this.secondsPlayer_ = (function(el) {
    var steps = [
      {transform: 'rotate(0deg)'},
      {transform: 'rotate(360deg)'}
    ];
    return el.animate(steps, {duration: 60 * 1000, iterations: Infinity});
  }(this.secondsPointer_));
};

/**
 * Initializes the class.
 */
app.Clock.prototype.init = function() {
  this.context_.addEventListener('click', this.onClockClick_);
};

/**
 * Prepares to destroy this instance by removing
 * any event listeners and doing additional cleaning up.
 */
app.Clock.prototype.destroy = function() {
  this.context_.removeEventListener('click', this.onClockClick_);
  this.secondsPlayer_.cancel();
};

/**
 * Animates the hour, seconds and minutes pointer in the clock.
 * @private
 */
app.Clock.prototype.spinPointers_ = function() {
  var secondsTransform = app.shared.utils.computedTransform(this.secondsPointer_);
  var secondsAnim = this.secondsPointer_.animate([
    {transform: 'rotate(' + secondsTransform.rotate + 'deg)'},
    {transform: 'rotate(' + (secondsTransform.rotate + (360 * 2.5)) + 'deg)'}
  ], {duration: 1250, easing: 'ease-out'});

  // Offset the background animation by the interactive animation's length: at
  // 1.25 seconds back (animation time) plus 30 seconds (half offset).
  this.secondsPlayer_.currentTime += (-1.25 + 30) * 1000;

  var sharedTiming = {duration: 500, easing: 'ease-out'};

  var hourTransform = app.shared.utils.computedTransform(this.hourPointer_);
  var hourFinal = 'rotate(' + (hourTransform.rotate + 30) + 'deg)';
  var hourAnim = this.hourPointer_.animate([
    {transform: 'rotate(' + hourTransform.rotate + 'deg)'},
    {transform: hourFinal}
  ], sharedTiming);
  AnimationUtilApply(hourAnim.effect);

  var minutesTransform = app.shared.utils.computedTransform(this.minutesPointer_);
  var minutesFinal = 'rotate(' + (minutesTransform.rotate + 390) + 'deg)';
  var minutesAnim = this.minutesPointer_.animate([
    {transform: 'rotate(' + minutesTransform.rotate + 'deg)'},
    {transform: minutesFinal}
  ], sharedTiming);
  AnimationUtilApply(minutesAnim.effect);
};

/**
 * Callback for when a clock is actually clicked.
 * @private
 */
app.Clock.prototype.onClockClick_ = function() {
  this.spinPointers_();
};

