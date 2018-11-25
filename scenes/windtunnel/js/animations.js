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

goog.provide('app.Animations');

goog.require('app.Constants');
goog.require('app.shared.utils');

/**
 * Class to manage animations.
 *
 * @constructor
 */
app.Animations = function() {
  this.fanStateMap_ = {};
  this.fanStateMap_[app.Constants.FAN_STATE_LOW] = {
    beginAngle: -25,
    endAngle: -35,
    backgroundDuration: 12
  };
  this.fanStateMap_[app.Constants.FAN_STATE_MED] = {
    beginAngle: -10,
    endAngle: -20,
    backgroundDuration: 9
  };
  this.fanStateMap_[app.Constants.FAN_STATE_HIGH] = {
    beginAngle: 5,
    endAngle: -5,
    backgroundDuration: 4
  };
};

/**
 * @param {!Element} element  The animation target element.
 * @param {number} fanState The fan state.
 * @param {number} duration The animation duration in milliseconds.
 * @return {!SequenceEffect} The animation for the given element and fan state.
 */
app.Animations.prototype.getParachuteAnimation = function(element, fanState, duration) {
  var transform = app.shared.utils.computedTransform(element);
  var currentAngle = transform.rotate;
  var beginAngle = this.fanStateMap_[fanState].beginAngle;
  var endAngle = this.fanStateMap_[fanState].endAngle;

  var initialTransition = new KeyframeEffect(element, [
      {transform: 'rotateZ(' + currentAngle + 'deg)'},
      {transform: 'rotateZ(' + beginAngle + 'deg)'}
  ], 500 * Math.abs(beginAngle - currentAngle) / 20.0);

  var timing = {
    direction: 'alternate',
    duration: duration,
    easing: 'ease-in-out',
    iterations: Infinity
  };

  var animation = new KeyframeEffect(element, [
      {transform: 'rotateZ(' + beginAngle + 'deg)'},
      {transform: 'rotateZ(' + endAngle + 'deg)'}
    ], timing);

  return new SequenceEffect([initialTransition, animation]);
};

/**
 * @param {!Element} element  The animation target element.
 * @param {number} fanState The fan state.
 * @return {!SequenceEffect} The animation for the given element and fan state.
 */
app.Animations.prototype.getBackgroundAnimation = function(element, fanState) {
  var transform = app.shared.utils.computedTransform(element);
  var currentOffset = transform.x;
  var endOffset = -app.Constants.SCREEN_BACKGROUND_WIDTH;
  var duration = this.fanStateMap_[fanState].backgroundDuration;

  var initialTransition = new KeyframeEffect(element, [
      {transform: 'translateX(' + currentOffset + 'px)'},
      {transform: 'translateX(' + endOffset + 'px)'}
  ], (duration * 1000) * ((endOffset - currentOffset) / endOffset));

  var animation = new KeyframeEffect(element, [
      {transform: 'translateX(0)'},
      {transform: 'translateX(' + endOffset + 'px)'}
  ], {
      duration: duration * 1000,
      iterations: Infinity
  });

  return new SequenceEffect([initialTransition, animation]);
};
