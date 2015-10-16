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

goog.provide('app.TetrisTruck');

goog.require('app.Constants');
goog.require('app.shared.utils');

/**
 * Class for the Truck picking up Tetris blocks
 *
 * @param {!Element} truckEl DOM element containing the truck.
 * @param {!Element} cogEl DOM element containing the tetris machine cog.
 * @constructor
 */
app.TetrisTruck = function(truckEl, cogEl) {
  this.$el = $(truckEl);
  this.$cogEl = $(cogEl);
  this.$wheelOne = this.$el.find('.js-truck-wheel-one');
  this.$wheelTwo = this.$el.find('.js-truck-wheel-two');

  this.loads = this.$el.find('.js-truck-load').children();
  this.numberOfLoads = this.loads.length;
  this.loadCounter = -1;
  this.running = false;

  this.run_ = this.run_.bind(this);

  /** @private {Animation} */
  this.player_ = null;

  var c = app.Constants;
  var totalDuration = c.DELAY_MS + (c.DRIVE_MS * 2) + c.LOAD_MS + c.DROP_MS;

  this.offsets_ = {
    enter: c.DELAY_MS / totalDuration,
    load: (c.DELAY_MS + c.DRIVE_MS) / totalDuration,
    drop: (c.DELAY_MS + c.DRIVE_MS + c.LOAD_MS) / totalDuration,
    exit: (c.DELAY_MS + c.DRIVE_MS + c.LOAD_MS + c.DROP_MS) / totalDuration
  };

  this.timing_ = {
    duration: totalDuration
  };

  this.running = true;
  this.run_();
};

app.TetrisTruck.prototype = {

  /**
   * @private
   * @return {!Element}
   */
  getLoad_: function() {
    this.loadCounter++;
    var loadIndex = this.loadCounter % this.numberOfLoads;
    return this.loads[loadIndex];
  },

  /**
   * @private
   * @return {!AnimationEffectReadOnly}
   */
  getDriveAnimation_: function() {
    var c = app.Constants;
    var driveKeyframes = [
      {transform: 'translate3d(100%,0,0)', offset: 0},
      {transform: 'translate3d(100%,0,0)', offset: this.offsets_.enter, easing: c.EASE_IN_OUT_QUAD},
      {transform: 'translate3d(0%,0,0)', offset: this.offsets_.load},
      {transform: 'translate3d(0%,0,0)', offset: this.offsets_.exit, easing: c.EASE_IN_OUT_QUAD},
      {transform: 'translate3d(-100%,0,0)', offset: 1}
    ];
    return new KeyframeEffect(this.$el[0], driveKeyframes, this.timing_);
  },

  /**
   * @private
   * @return {!AnimationEffectReadOnly}
   */
  getWheelAnimation_: function() {
    var c = app.Constants;
    var wheelAnimationKeyframes = [
      {transform: 'rotateZ(0deg)', offset: 0},
      {transform: 'rotateZ(0deg)', offset: this.offsets_.enter, easing: c.EASE_IN_OUT_QUAD},
      {transform: 'rotateZ(-1080deg)', offset: this.offsets_.load},
      {transform: 'rotateZ(-1080deg)', offset: this.offsets_.exit, easing: c.EASE_IN_OUT_QUAD},
      {transform: 'rotateZ(-2160deg)', offset: 1}
    ];
    return new GroupEffect([
      new KeyframeEffect(this.$wheelOne[0], wheelAnimationKeyframes, this.timing_),
      new KeyframeEffect(this.$wheelTwo[0], wheelAnimationKeyframes, this.timing_)
    ]);
  },

  /**
   * @private
   * @return {!AnimationEffectReadOnly}
   */
  getCogAnimation_: function() {
    var cogAnimationKeyframes = [
      {transform: 'rotateZ(0deg)', offset: 0},
      {transform: 'rotateZ(0deg)', offset: this.offsets_.load},
      {transform: 'rotateZ(360deg)', offset: this.offsets_.drop},
      {transform: 'rotateZ(360deg)', offset: 1}
    ];
    return new KeyframeEffect(this.$cogEl[0], cogAnimationKeyframes, this.timing_);
  },

  /**
   * @private
   * @return {!AnimationEffectReadOnly}
   */
  getLoadAnimation_: function() {
    var c = app.Constants;
    var loadEl = this.getLoad_();
    var loadAnimationKeyframes = [
      {transform: 'translateY(-120px)', offset: 0},
      {transform: 'translateY(-120px)', offset: this.offsets_.load},
      {transform: 'translateY(-80px)', offset: this.offsets_.drop, easing: c.EASE_IN_QUAD},
      {transform: 'translateY(0)', offset: this.offsets_.exit},
      {transform: 'translateY(0)', offset: 1}
    ];
    return new KeyframeEffect(loadEl, loadAnimationKeyframes, this.timing_);
  },

  /**
   * @private
   */
  run_: function() {
    this.destroyPlayer_();
    if (!this.running) {
      return;
    }

    var driveAnimation = this.getDriveAnimation_();
    var wheelAnimation = this.getWheelAnimation_();
    var cogAnimation = this.getCogAnimation_();
    var loadAnimation = this.getLoadAnimation_();

    var animationsTiming = {iterations: 1};
    var animations = new GroupEffect([
      driveAnimation,
      loadAnimation,
      cogAnimation,
      wheelAnimation
    ], animationsTiming);

    this.player_ = document.timeline.play(animations);
    app.shared.utils.onWebAnimationFinished(this.player_, this.run_);

    window.santaApp.fire('sound-trigger', 'factory_car');
  },

  /**
   * @private
   */
  destroyPlayer_: function() {
    this.player_ && this.player_.cancel();
    this.player_ = null;
  },

  /**
   * Stop scene and unbind
   */
  destroy: function() {
    this.running = false;
    this.destroyPlayer_();
  }
};
