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

goog.provide('app.FanStateManager');

goog.require('app.Animations');
goog.require('app.Constants');

/**
 * Manages the current fan speed and scene elements that depend on it.
 *
 * @param {!Element} context DOM element that wraps the scene.
 * @param {!app.Rudolf} rudolf The scene's rudolf.
 * @constructor
 */
app.FanStateManager = function(context, rudolf) {
  this.stateCycle_ = [
    app.Constants.FAN_STATE_LOW,
    app.Constants.FAN_STATE_MED,
    app.Constants.FAN_STATE_HIGH
  ];

  this.stateConfigMap_ = {};
  this.stateConfigMap_[app.Constants.FAN_STATE_LOW] =
      app.Constants.FAN_SPEED_CONFIGS[0];
  this.stateConfigMap_[app.Constants.FAN_STATE_MED] =
      app.Constants.FAN_SPEED_CONFIGS[1];
  this.stateConfigMap_[app.Constants.FAN_STATE_HIGH] =
      app.Constants.FAN_SPEED_CONFIGS[2];

  this.currentStateIndex_ = 0;
  this.stateChangeDelta_ = 1;

  this.rudolf_ = rudolf;

  this.animations_ = new app.Animations();

  const dummyAnimation = document.timeline.play(new SequenceEffect([]));

  this.windBalloonElem_ = /** @type {!Element} */ (context.querySelector('.wind-balloon'));
  this.windBalloonAnimation_ = dummyAnimation;

  this.screenElem_ = /** @type {!Element} */ (context.querySelector('.screen'));
  this.screenAnimation_ = dummyAnimation;
};

/**
 * Initializes the FanStateManager.
 */
app.FanStateManager.prototype.init = function() {
  this.updateAnimations_();
};

/**
 * Clean up.
 */
app.FanStateManager.prototype.destroy = function() {
  this.stopAnimations_();
};

/**
 * Cycles to the next state, alternating directions when either extreme
 * is reached.
 */
app.FanStateManager.prototype.cycleState = function() {
  var newIndex = this.currentStateIndex_ + this.stateChangeDelta_;
  if (newIndex < 0 || newIndex >= this.stateCycle_.length) {
    this.stateChangeDelta_ *= -1;
    newIndex = this.currentStateIndex_ + this.stateChangeDelta_;
  }
  this.currentStateIndex_ = newIndex;

  window.setTimeout(function() {
    this.updateScene_();
  }.bind(this), app.Constants.FAN_SPEED_CHANGE_DELAY_MS);

  Klang.triggerEvent('windtunnel_fan_speed', this.getConfig().soundValue);
};

/**
 * @return {number} The current state.
 */
app.FanStateManager.prototype.getState = function() {
  return this.stateCycle_[this.currentStateIndex_];
};

/**
 * Get the config for the current state.
 * @return {Object} An object containing constants for this state.
 */
app.FanStateManager.prototype.getConfig = function() {
  return this.stateConfigMap_[this.stateCycle_[this.currentStateIndex_]];
};

/**
 * @return {number} The fan lever angle for the current state.
 */
app.FanStateManager.prototype.getLeverAngle = function() {
  var config = this.getConfig();
  return config.leverAngle;
};

/**
 * @return {number} The fan speed indicator offset for the current state.
 */
app.FanStateManager.prototype.getIndicatorOffset = function() {
  var config = this.getConfig();
  return config.indicatorOffset;
};

/**
 * @return {string} The threads classname for the current state.
 */
app.FanStateManager.prototype.getThreadsClass = function() {
  var config = this.getConfig();
  return config.threadClass;
};

/**
 * Updates elements of the scene that depend on the fan speed.
 *
 * @private
 */
app.FanStateManager.prototype.updateScene_ = function() {
  this.rudolf_.onFanStateChanged(this.getState());
  this.updateAnimations_();
};

/**
 * Update animations to reflect the current fan state.
 *
 * @private
 */
app.FanStateManager.prototype.updateAnimations_ = function() {
  // Grab the state before animations are killed.
  const windBalloonEffect = this.animations_.getParachuteAnimation(
      this.windBalloonElem_, this.getState(),
      app.Constants.WIND_BALLOON_ANIMATION_DURATION_MS);
  const screenEffect = this.animations_.getBackgroundAnimation(
      this.screenElem_, this.getState());

  this.stopAnimations_();

  this.windBalloonAnimation = document.timeline.play(windBalloonEffect);
  this.screenAnimation = document.timeline.play(screenEffect);
};

/**
 * Stops the animations.
 *
 * @private
 */
app.FanStateManager.prototype.stopAnimations_ = function() {
  this.windBalloonAnimation_.cancel();
  this.screenAnimation_.cancel();
};

