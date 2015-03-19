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

goog.provide('app.House');

goog.require('app.Constants');
goog.require('app.InputEvent');
goog.require('app.shared.utils');

/**
 * House class. Encapsulates the behavior of a single house in the playground.
 *
 * @param {!Element} context An DOM element which wraps the house.
 * @constructor
 */
app.House = function(context) {
  this.context_ = context;
  this.$context_ = $(context);

  this.eyesMediator = null;
  this.colorMediator = null;

  this.$noses_ = this.$context_.find(app.Constants.HOUSE_NOSE_SELECTOR);
  this.$iris_ = this.$context_.find(app.Constants.HOUSE_IRIS_SELECTOR);
  this.$background_ = this.$context_.find(app.Constants.HOUSE_BG_SELECTOR);
  this.$window_ = $(window);

  this.mouthContainer = this.$context_.find('.face__mouth')[0];
  this.mouthEllipse = this.$context_.find('.face__mouth svg ellipse')[0];

  this.colorPlayer = null;
  this.eyesPlayer = null;
  this.mouthPlayer = null;

  // maintain scope
  this.onHouseClick_ = this.onHouseClick_.bind(this);
  this.onNoseClick_ = this.onNoseClick_.bind(this);
  this.onWindowResize_ = this.onWindowResize_.bind(this);

  this.color = this.$context_.data('color');
  this.noseIndex_ = 0;
  this.isBusyBeingSurprised = false;
  this.numberOfNoses_ = this.$noses_.length;
  this.prevTheta = 0;

  this.eyesPosition_ = {x: 0, y: 0};

  // Go!
  this.init_();
};

app.House.prototype = {

  /**
   * Initializes the house by binding some events.
   * @private
   */
  init_: function() {
    this.addEventListeners_();

    // mouth
    this.mouthNormal = {
      cx: parseFloat(this.mouthEllipse.getAttribute('cx')),
      cy: parseFloat(this.mouthEllipse.getAttribute('cy')),
      rx: parseFloat(this.mouthEllipse.getAttribute('rx')),
      ry: parseFloat(this.mouthEllipse.getAttribute('ry'))
    };

    this.mouthSurprised = app.Constants.MOUTH_SURPRISED;

    this.calculatePositions_();
  },

  /**
   * @private
   */
  calculatePositions_: function() {
    this.iris_ = {
      x: 0,
      y: 0,
      size: this.$iris_.width(),
      radius: this.$iris_.width() / 2
    };

    var houseRect = this.$context_[0].getBoundingClientRect();
    var irisRect = this.$iris_[0].getBoundingClientRect();
    this.eyesPosition_ = {
      x: (houseRect.left + houseRect.right) / 2,
      y: irisRect.top + this.iris_.radius
    };

    // How much far the iris can go, don't exceed the eye
    this.distanceThreshold_ = app.Constants.EYE_DIAMETER - this.iris_.radius - 1;

    // How far away from the eyes the iris have moved furthest from the eye center
    this.maxEyeMoveThreashold_ = this.$context_.width();
  },

  /**
   * @private
   */
  onWindowResize_: function() {
    this.calculatePositions_();
  },

  /**
   * @private
   */
  addEventListeners_: function() {
    this.$context_.on(app.InputEvent.START, this.onHouseClick_);
    this.$noses_.on(app.InputEvent.START, this.onNoseClick_);
    this.$window_.on('resize', this.onWindowResize_);
  },

  /**
   * @private
   */
  removeEventListeners_: function() {
    this.$context_.off(app.InputEvent.START, this.onHouseClick_);
    this.$noses_.off(app.InputEvent.START, this.onNoseClick_);
    this.$window_.off('resize', this.onWindowResize_);
  },

  /**
   * @private
   */
  onHouseClick_: function() {
    this.colorMediator.publish(this.color, this);
    window.santaApp.fire('sound-trigger', 'playground_color');
  },

  /**
   * @private
   */
  onNoseClick_: function(e) {
    e.stopPropagation();
    e.stopImmediatePropagation();

    var oldNoseIndex = this.noseIndex_ % this.numberOfNoses_;
    var oldNose = this.$noses_[oldNoseIndex];

    // start new animation
    this.noseIndex_++;
    var newNoseIndex = this.noseIndex_ % this.numberOfNoses_;
    var newNose = this.$noses_[newNoseIndex];

    var animationTiming = {
      duration: app.Constants.NOSE_TRANSITION_DURATION,
      fill: 'both',
      easing: app.Constants.EASE_OUT_QUAD
    };

    var anim = new AnimationGroup([
      new Animation(newNose, [
        {transform: 'scale(0) rotate(-90deg)', visibility: 'hidden'},
        {transform: 'scale(1) rotate(0deg)', visibility: 'visible'}
      ], animationTiming),
      new Animation(oldNose, [
        {transform: 'scale(1) rotate(0deg)', visibility: 'visible'},
        {transform: 'scale(0) rotate(90deg)', visibility: 'hidden'}
      ], animationTiming)
    ]);

    var player = document.timeline.play(anim);

    this.makeSurpriseFace_(
      app.Constants.SURPRISED_FACE_NOSE_DURATION,
      app.Constants.SURPRISED_FACE_NOSE_DELAY
    );

    window.santaApp.fire('sound-trigger', 'playground_nose');
  },

  /**
   * @private
   */
  animateSmallMouth_: function(timeFraction, currentTarget, animation) {
    var rx = this.mouthNormal.rx + (this.mouthSurprised.rx - this.mouthNormal.rx) * timeFraction;
    var ry = this.mouthNormal.ry + (this.mouthSurprised.ry - this.mouthNormal.ry) * timeFraction;
    var cx = this.mouthNormal.cx + (this.mouthSurprised.cx - this.mouthNormal.cx) * timeFraction;
    var cy = this.mouthNormal.cy + (this.mouthSurprised.cy - this.mouthNormal.cy) * timeFraction;
    currentTarget.setAttribute('rx', rx);
    currentTarget.setAttribute('ry', ry);
    currentTarget.setAttribute('cx', cx);
    currentTarget.setAttribute('cy', cy);
  },

  /**
   * @private
   */
  animateLargeMouth_: function(timeFraction, currentTarget, animation) {
    var rx = this.mouthSurprised.rx + (this.mouthNormal.rx - this.mouthSurprised.rx) * timeFraction;
    var ry = this.mouthSurprised.ry + (this.mouthNormal.ry - this.mouthSurprised.ry) * timeFraction;
    var cx = this.mouthSurprised.cx + (this.mouthNormal.cx - this.mouthSurprised.cx) * timeFraction;
    var cy = this.mouthSurprised.cy + (this.mouthNormal.cy - this.mouthSurprised.cy) * timeFraction;
    currentTarget.setAttribute('rx', rx);
    currentTarget.setAttribute('ry', ry);
    currentTarget.setAttribute('cx', cx);
    currentTarget.setAttribute('cy', cy);
  },

  /**
   * @private
   */
  makeSuprisedMouth_: function(surprisedDuration, surprisedDelay) {
    if (!app.shared.utils.playerFinished(this.mouthPlayer)) {
      // keep surprised face while clicking fast on nose
      this.mouthPlayer.currentTime = surprisedDelay + app.Constants.SUPRISED_ANIMATION_DURATION;
      return;
    }

    this.mouthAnimation = new AnimationSequence([
      new Animation(
        this.mouthEllipse,
        this.animateSmallMouth_.bind(this),
        {
          delay: surprisedDelay,
          duration: app.Constants.SUPRISED_ANIMATION_DURATION,
          easing: app.Constants.EASE_OUT_QUAD,
          fill: 'forwards'
        }
      ),
      new Animation(
        this.mouthEllipse,
        this.animateLargeMouth_.bind(this),
        {
          delay: surprisedDuration,
          duration: app.Constants.SUPRISED_ANIMATION_DURATION,
          easing: app.Constants.EASE_OUT_QUAD,
          fill: 'forwards'
        }
      )
    ], {fill: 'none'});

    this.mouthPlayer = document.timeline.play(this.mouthAnimation);
  },

  /**
   * @private
   */
  makeSuprisedEyes_: function(surprisedDuration, surprisedDelay) {
    if (!app.shared.utils.playerFinished(this.eyesPlayer)) {
      // keep surprised face while clicking fast on nose
      this.eyesPlayer.currentTime = surprisedDelay + app.Constants.SUPRISED_ANIMATION_DURATION;
      return;
    }

    this.isBusyBeingSurprised = true;

    var animObj = {
      aIn: {
        from: { transform: 'scale(1)' },
        to: { transform: 'scale(0.6)' }
      },
      aOut: {
        from: { transform: 'scale(0.6)' },
        to: { transform: 'scale(1)' }
      },
      timingIn: {
        duration: app.Constants.SUPRISED_ANIMATION_DURATION,
        delay: surprisedDelay,
        fill: 'forwards',
        easing: app.Constants.EASE_OUT_QUAD
      },
      timingOut: {
        duration: app.Constants.SUPRISED_ANIMATION_DURATION,
        delay: surprisedDuration,
        fill: 'forwards',
        easing: app.Constants.EASE_OUT_QUAD
      }
    };

    var anim = new AnimationGroup([
      new AnimationSequence([
        new Animation(this.$iris_.eq(0)[0],
          [animObj.aIn.from, animObj.aIn.to],
          animObj.timingIn
        ),
        new Animation(this.$iris_.eq(0)[0],
          [animObj.aOut.from, animObj.aOut.to],
          animObj.timingOut
        )
      ]),
      new AnimationSequence([
        new Animation(this.$iris_.eq(1)[0],
          [animObj.aIn.from, animObj.aIn.to],
          animObj.timingIn
        ),
        new Animation(this.$iris_.eq(1)[0],
          [animObj.aOut.from, animObj.aOut.to],
          animObj.timingOut
        )
      ])
    ], {fill: 'none'});

    this.eyesPlayer = document.timeline.play(anim);

    this.eyesPlayer.addEventListener('finish', function() {
      // Unlock the surprised flag so the eyes cal follow the mouse
      this.isBusyBeingSurprised = false;
    }.bind(this));
  },

  /**
   * @private
   */
  makeSurpriseFace_: function(surprisedDuration, surprisedDelay) {
    this.makeSuprisedMouth_(surprisedDuration, surprisedDelay);
    this.makeSuprisedEyes_(surprisedDuration, surprisedDelay);
  },

  /**
   * Change the color of this house (temporarily) to the given color.
   * @param {string} hexColor target color
   */
  changeColor: function(hexColor) {
    var el = this.$background_[0];
    var style = window.getComputedStyle(el);

    var anim = new AnimationSequence([
        new Animation(el,
          [
            { fill: style.fill },  // transform from current color
            { fill: hexColor }
          ],
          {
            duration: app.Constants.COLOR_IN_DURATION,
            fill: 'forwards',
            easing: app.Constants.EASE_IN_QUAD
          }),
        new Animation(el,
          [
            { fill: hexColor },
            { fill: this.color }
          ],
          {
            duration: app.Constants.COLOR_OUT_DURATION,
            delay: app.Constants.COLOR_OUT_DELAY,
            fill: 'forwards',
            easing: app.Constants.EASE_OUT_QUAD
          })
    ], {fill: 'none'});

    this.colorPlayer = document.timeline.play(anim);

    this.makeSurpriseFace_(
      app.Constants.SURPRISED_FACE_COLOR_DURATION,
      app.Constants.SURPRISED_FACE_COLOR_DELAY
    );
  },

  /**
   * Orient the house eyes to focus on the current mouse position.
   * @param {!Object} mouse containing x/y
   */
  moveEyes: function(mouse) {
    if (this.isBusyBeingSurprised) {
      return;
    }

    var adj = mouse.x - this.eyesPosition_.x;
    var opp = mouse.y - this.eyesPosition_.y;

    var theta = -1 * Math.atan2(adj, opp) * (180 / Math.PI);
    var maxDistance = Math.max(Math.abs(adj), Math.abs(opp));
    var distanceMultiplier = Math.min(1, maxDistance / this.maxEyeMoveThreashold_);
    var px = this.distanceThreshold_ * distanceMultiplier;

    this.$iris_.css(
      Modernizr.prefixed('transform'),
      'rotate(' + theta + 'deg) translateY(' + px + 'px)'
    );

    this.prevTheta = theta;
  },

  /**
   * Release event listeners
   */
  destroy: function() {
    this.removeEventListeners_();
  }
};
