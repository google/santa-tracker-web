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

goog.provide('app.Rudolf');

goog.require('app.Animations');
goog.require('app.Constants');

/**
 * Windtunnel Rudolf class.
 *
 * @param {!Element} context DOM element that wraps Rudolf.
 * @constructor
 */
app.Rudolf = function(context) {
  this.context_ = $(context);

  this.light_ = this.context_.find('.rudolf-light');
  this.rudolf_ = this.context_.find('.rudolf');
  this.parachuteContainer_ = this.context_.find('.parachute-wrap');
  this.parachuteElem_ = this.parachuteContainer_.find('.parachute');
  this.parachuteShadowElem_ = this.parachuteContainer_.find('.parachute-shadow');

  this.fanState_ = app.Constants.FAN_STATE_LOW;

  this.animations_ = new app.Animations();

  /** @private {AnimationEffectReadOnly} */
  this.parachuteAnimation_ = null;

  /** @private {AnimationEffectReadOnly} */
  this.parachuteShadowAnimation_ = null;

  /** @private {Animation} */
  this.animationPlayer_ = null;

  this.onRudolfClicked_ = this.onRudolfClicked_.bind(this);

  this.updateAnimations_();
};

/**
 * Initializes Rudolf.
 */
app.Rudolf.prototype.init = function() {
  this.addEventListeners_();
  this.startParachuteAnimation_();
};

/**
 * Removes event listeners and other cleanup.
 */
app.Rudolf.prototype.destroy = function() {
  this.removeEventListeners_();
  this.stopParachuteAnimation_();
};

/**
 * Update rudolf based on fan speed.
 * @param  {number} state The new state.
 */
app.Rudolf.prototype.onFanStateChanged = function(state) {
  this.fanState_ = state;

  if (state == app.Constants.FAN_STATE_HIGH) {
    this.context_.removeClass(app.Constants.RUDOLF_NORMAL_CLASSNAME)
        .addClass(app.Constants.RUDOLF_SERIOUS_CLASSNAME);
  } else if (this.context_.hasClass(app.Constants.RUDOLF_SERIOUS_CLASSNAME)) {
    this.context_.removeClass(app.Constants.RUDOLF_SERIOUS_CLASSNAME)
        .addClass(app.Constants.RUDOLF_NORMAL_CLASSNAME);
  }

  this.stopParachuteAnimation_();
  this.updateAnimations_();
  this.startParachuteAnimation_();
};

/**
 * Binds event listeners to some elements.
 *
 * @private
 */
app.Rudolf.prototype.addEventListeners_ = function() {
  this.rudolf_.on('click', this.onRudolfClicked_);
};

/**
 * Un-binds event listeners.
 *
 * @private
 */
app.Rudolf.prototype.removeEventListeners_ = function() {
  this.rudolf_.off('click', this.onRudolfClicked_);
};

/**
 * Toggles Rudolf's nose.
 *
 * @private
 */
app.Rudolf.prototype.onRudolfClicked_ = function() {
  var currentOpacity = this.light_.css('opacity');
  this.light_.css('opacity', currentOpacity == 0 ? 0.6 : 0);
};

/**
 * Update animations to reflect the current fan state.
 *
 * @private
 */
app.Rudolf.prototype.updateAnimations_ = function() {
  this.parachuteAnimation_ = this.animations_.getParachuteAnimation(
      this.parachuteElem_.get(0), this.fanState_,
      app.Constants.PARACHUTE_ANIMATION_DURATION_MS);
  this.parachuteShadowAnimation_ = this.animations_.getParachuteAnimation(
      this.parachuteShadowElem_.get(0), this.fanState_,
      app.Constants.PARACHUTE_ANIMATION_DURATION_MS);
};

/**
 * Starts parachute animation.
 *
 * @private
 */
app.Rudolf.prototype.startParachuteAnimation_ = function() {
  this.animationPlayer_ = document.timeline.play(new GroupEffect([
      this.parachuteAnimation_,
      this.parachuteShadowAnimation_
  ]));
};

/**
 * Stops parachute animation.
 *
 * @private
 */
app.Rudolf.prototype.stopParachuteAnimation_ = function() {
  if (this.animationPlayer_) {
    this.animationPlayer_.pause();
  }
};
