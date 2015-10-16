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


goog.provide('app.CandyMachine');

goog.require('app.Constants');
goog.require('app.InputEvent');
goog.require('app.shared.utils');

/**
 * Class for the Elf pulling a lever to activate the Candy machine
 *
 * @param {!Element} context DOM element containing the scene
 * @constructor
 */
app.CandyMachine = function(context) {
  this.$el = $(context);
  this.$btnEl = this.$el.find('.js-drop-button');
  this.$elfMouthEl = this.$el.find('.js-drop-elf-mouth');
  this.$elfHeadEl = this.$el.find('.js-drop-elf-head');
  this.$elfArmEl = this.$el.find('.js-drop-elf-arm');
  this.$elfBellyEl = this.$el.find('.js-drop-elf-belly');
  this.$leverEl = this.$el.find('.js-drop-lever');
  this.$barrelEl = this.$el.find('.js-drop-barrel');
  this.$ballEl = this.$el.find('.js-drop-ball');

  this.run = this.run.bind(this);
  this.onBellyFull_ = this.onBellyFull_.bind(this);
  this.reduceBelly_ = this.reduceBelly_.bind(this);
  this.reduceBellyTimer_ = undefined;
  this.hasBigBelly_ = false;

  /** @private {Animation} */
  this.player_ = null;

  /** @private {Animation} */
  this.bellyPlayer_ = null;

  this.init_();
};

app.CandyMachine.prototype = {

  /**
   * @private
   */
  init_: function() {
    var c = app.Constants;
    var duration = c.PULL_MS + c.LOOKUP_MS + c.BALLDROP_MS + c.SWALLOW_MS + c.BELLY_MS + c.PUSH_MS;

    this.offsets_ = {
      pull: 0,
      lookup: c.PULL_MS / duration,
      gape: (c.PULL_MS + c.LOOKUP_MS) / duration,
      swallow: (c.PULL_MS + c.LOOKUP_MS + c.BALLDROP_MS) / duration,
      belly: (c.PULL_MS + c.LOOKUP_MS + c.BALLDROP_MS + c.SWALLOW_MS) / duration,
      push: (c.PULL_MS + + c.LOOKUP_MS + c.BALLDROP_MS + c.SWALLOW_MS + c.BELLY_MS) / duration
    };

    this.timing_ = {
      duration: duration,
      easing: c.EASE_OUT_QUAD,
      fill: 'forwards'
    };

    this.duration_ = duration;

    this.$btnEl.on(app.InputEvent.START, this.run);
  },

  /**
   * @private
   * @return {!AnimationEffectReadOnly}
   */
  getPullAnimation_: function() {
    var c = app.Constants;

    var armKeyframes = [
      {transform: 'translate3d(0px,0,0)', offset: 0},
      {transform: 'translate3d(-20px,0,0)', offset: this.offsets_.lookup},
      {transform: 'translate3d(-20px,0,0)', offset: this.offsets_.push, easing: c.EASE_IN_QUAD},
      {transform: 'translate3d(0px,0,0)', offset: 1}
    ];

    var leverKeyframes = [
      {transform: 'rotateZ(0deg)', offset: 0},
      {transform: 'rotateZ(-18deg)', offset: this.offsets_.lookup},
      {transform: 'rotateZ(-18deg)', offset: this.offsets_.push, easing: c.EASE_IN_QUAD},
      {transform: 'rotateZ(0deg)', offset: 1}
    ];

    var arm = new KeyframeEffect(this.$elfArmEl[0], armKeyframes, this.timing_);
    var lever = new KeyframeEffect(this.$leverEl[0], leverKeyframes, this.timing_);

    return new GroupEffect([arm, lever]);
  },

  /**
   * @private
   * @return {!AnimationEffectReadOnly}
   */
  getSwallowAnimation_: function() {
    var c = app.Constants;

    var headKeyframes = [
      {transform: 'rotateZ(95deg)', offset: 0},
      {transform: 'rotateZ(95deg)', offset: this.offsets_.pull},
      {transform: 'rotateZ(0deg)', offset: this.offsets_.gape},
      {transform: 'rotateZ(0deg)', offset: this.offsets_.swallow},
      {transform: 'rotateZ(95deg)', offset: this.offsets_.belly},
      {transform: 'rotateZ(95deg)', offset: 1}
    ];

    var mouthKeyframes = [
      {transform: 'rotateZ(0deg)', offset: 0},
      {transform: 'rotateZ(0deg)', offset: this.offsets_.pull},
      {transform: 'rotateZ(45deg)', offset: this.offsets_.gape},
      {transform: 'rotateZ(45deg)', offset: this.offsets_.swallow},
      {transform: 'rotateZ(0deg)', offset: this.offsets_.belly},
      {transform: 'rotateZ(0deg)', offset: 1}
    ];

    var head = new KeyframeEffect(this.$elfHeadEl[0], headKeyframes, this.timing_);
    var mouth = new KeyframeEffect(this.$elfMouthEl[0], mouthKeyframes, this.timing_);

    return new GroupEffect([head, mouth]);
  },

  /**
   * @private
   * @return {!AnimationEffectReadOnly}
   */
  getBellyAnimation_: function() {
    var c = app.Constants;

    var bellyKeyframes = [
      {transform: 'translateX(0px)', offset: 0},
      {transform: 'translateX(0px)', offset: this.offsets_.swallow, easing: c.EASE_IN_OUT_QUAD},
      {transform: 'translateX(14px)', offset: this.offsets_.push, easing: c.EASE_IN_OUT_QUAD},
      {transform: 'translateX(14px)', offset: 1}
    ];

    return new KeyframeEffect(this.$elfBellyEl[0], bellyKeyframes, this.timing_);
  },

  /**
   * Runs the eating candy animation.
   */
  run: function() {
    if (!app.shared.utils.playerFinished(this.player_)) {
      return;
    }

    app.shared.utils.animWithClass(this.$barrelEl, 'run-animation');
    app.shared.utils.animWithClass(this.$ballEl, 'run-animation');

    var pullAnimation = this.getPullAnimation_();
    var swallowAnimation = this.getSwallowAnimation_();

    var animations = new GroupEffect([
      pullAnimation,
      swallowAnimation
    ], {iterations: 1}); // needed for finish event

    this.player_ = document.timeline.play(animations);
    this.player_.addEventListener('finish', this.onBellyFull_);

    window.santaApp.fire('sound-trigger', 'factory_candy');

    if (this.hasBigBelly_) {
      window.clearTimeout(this.reduceBellyTimer_);
    } else {
      var bellyAnimation = this.getBellyAnimation_();
      this.hasBigBelly_ = true;
      this.bellyPlayer_ = document.timeline.play(bellyAnimation);
    }
  },

  /**
   * @private
   */
  reduceBelly_: function() {
    this.hasBigBelly_ = false;
    if (this.bellyPlayer_.playbackRate > 0) {
      // fast forward to where belly got big, slow down and reverse animation
      this.bellyPlayer_.currentTime = this.offsets_.push * this.duration_;
      this.bellyPlayer_.playbackRate = 0.5;
      this.bellyPlayer_.reverse();
    }
  },

  /**
   * @private
   */
  onBellyFull_: function() {
    this.reduceBellyTimer_ = window.setTimeout(this.reduceBelly_, 3000);
  },

  /**
   * Stop scene and unbind
   */
  destroy: function() {
    this.$btnEl.on(app.InputEvent.START, this.run_);

    this.player_ && this.player_.cancel();
    this.bellyPlayer_ && this.bellyPlayer_.cancel();

    window.clearTimeout(this.reduceBellyTimer_);
  }
};
