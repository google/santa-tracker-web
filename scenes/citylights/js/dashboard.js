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

goog.provide('app.Dashboard');

goog.require('app.Constants');
goog.require('app.PhotoSphere');
goog.require('app.shared.utils');



/**
 * Main class for the photo sphere dashboard carousel
 * @param {!Element} div DOM element containing the carousel.
 * @constructor
 */
app.Dashboard = function(div) {
  this.$el = $(div);
  this.$screens_ = undefined;

  this.currentIndex_ = 0;
  this.numberOfItems_ = undefined;
  this.loadTimer_ = undefined;
  this.paginationPlayer_ = undefined;

  this.getSphereAtPosition = this.getSphereAtPosition.bind(this);
};


app.Dashboard.prototype = {

  /**
   * @private
   */
  createItems_: function() {
    this.$screens_ = this.$el.find('.js-screen');

    this.$screens_.each(function() {
      var $sphere = $(this);

      // transform localizedtextNodes to data attributes
      $sphere.data('location', $sphere.find('.location').remove().text());
      $sphere.data('description', $sphere.find('.description').remove().text());

      var url = app.PhotoSphere.staticImageUrl($sphere.data('panoid'),
                                               $sphere.data('heading'),
                                               $sphere.data('pitch'));
      $sphere.find('img').attr('src', url);
      $sphere.find('figcaption').text($sphere.data('location'));
    });

    this.numberOfItems_ = this.$screens_.length;
  },


  /**
   * @private
   * @return {!Array.<!Object>}
   */
  getKeyframesForOffset_: function(index, direction) {
    var from = 100 * index;
    var to = from + (-1 * direction * 100);

    return [
      {transform: 'translateX(' + from + '%)'},
      {transform: 'translateX(' + to + '%)'}
    ];
  },

  /**
   * @private
   * @return {!HTMLElement}
   */
  getElementAtOffset_: function(offset) {
    return this.$screens_.get(this.getOffsetIndex_(offset));
  },

  /**
   * Used internally to run the carousel animation
   * @private
   * @param {number} direction Direction integer -1, 0, 1
   */
  transitionInDirection_: function(direction) {
    if (!app.shared.utils.playerFinished(this.paginationPlayer_)) {
      return;
    }

    var startOffset = direction < 0 ? -1 : 0;
    var animations = [];
    var timing = {
      duration: 850,
      fill: 'both',
      easing: app.Constants.EASE_IN_OUT_CIRC
    };

    for (var i = 0; i < 4; i++) {
      animations.push(new Animation(
          this.getElementAtOffset_(startOffset + i),
          this.getKeyframesForOffset_(startOffset + i, direction),
          timing));
    }

    var animationGroup = new AnimationGroup(animations);
    this.destroyPlayer_();
    this.paginationPlayer_ = document.timeline.play(animationGroup);

    this.currentIndex_ = this.getOffsetIndex_(direction);
  },

  /**
   * Modulo operation with support for negative numbers
   * @private
   * @param {number} n Total available numbers
   * @param {number} m Number to wrap around
   * @return {number}
   */
  mod_: function(n, m) {
    return ((m % n) + n) % n;
  },

  /**
   * Returns the item index at the specified offset from currentIndex_
   * @private
   * @param {number} offset Positive or negative number to offset curret index
   * @return {number}
   */
  getOffsetIndex_: function(offset) {
    var newIndex = this.currentIndex_ + offset;
    return this.mod_(this.numberOfItems_, this.currentIndex_ + offset);
  },

  /**
   * @private
   */
  destroyPlayer_: function() {
    if (this.paginationPlayer_) {
      this.paginationPlayer_.cancel();
      this.paginationPlayer_ = null;
    }
  },

  /**
   * Return Sphere ID for the specified position
   * @public
   * @param {string} position left, middle or right
   * @return {string}
   */
  getSphereAtPosition: function(position) {
    var positionOffset = app.Constants.POSITION_OFFSET[position];
    var index = this.getOffsetIndex_(positionOffset);
    var $screen = this.$screens_.eq(index);
    return {
      id: $screen.data('panoid'),
      location: $screen.data('location'),
      description: $screen.data('description'),
      pov: {
        heading: $screen.data('heading'),
        pitch: $screen.data('pitch')
      }
    };
  },

  /**
   * Cycle carousel left
   * @public
   */
  previous: function() {
    this.transitionInDirection_(-1);
    window.santaApp.fire('sound-trigger', 'citylights_slide');
  },

  /**
   * Cycle carousel right
   * @public
   */
  next: function() {
    this.transitionInDirection_(1);
    window.santaApp.fire('sound-trigger', 'citylights_slide');
  },

  /**
   * Load the carousel
   * @public
   * @param {function} callback Called when carousel has finished loading
   */
  load: function(callback) {
    this.createItems_();
    this.transitionInDirection_(0);
    this.loadTimer_ = window.setTimeout(callback, app.Constants.START_DELAY_MS);
  },

  /**
   * @public
   */
  destroy: function() {
    window.clearTimeout(this.loadTimer_);
    this.destroyPlayer_();
  }

};
