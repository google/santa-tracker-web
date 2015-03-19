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

goog.provide('app.Viewport');

goog.require('app.Constants');
goog.require('app.utils');



/**
 * The viewport.
 * @param {jQuery} elem DOM element containing the scene.
 * @param {jQuery} blocksElem
 * @param {jQuery} blocksContainerElem
 * @constructor
 */
app.Viewport = function(elem, blocksElem, blocksContainerElem) {
  this.elem = elem;
  this.viewportElem = this.elem.find('.scene');
  this.blocksElem = blocksElem;
  this.blocksContainerElem = blocksContainerElem;
  this.mountainElem = this.elem.find('.mountain');
  this.controlsElem = this.elem.find(app.Constants.SELECTOR_CONTROL_BUTTONS);
  this.controlLeftElem = this.elem.find(app.Constants.SELECTOR_CONTROL_LEFT);
  this.controlRightElem = this.elem.find(app.Constants.SELECTOR_CONTROL_RIGHT);

  this.currentPosition = null;
  this.currentDirectionIndex = 0; // -1 for left, 0 for middle, +1 for right
  this.lastDirectionIndex = 0; // -1 for left, 0 for middle, +1 for right

  this.isAnimating = false;

  this.numberOfBlocks = this.blocksElem.length;

  this.viewportWidth = null;
  this.viewportScaledWidth = null;
  this.blocksContainerWidth = null;
  this.blockWidth = null;

  // for swipe event
  this.touchStartX = null;
  this.touchStartY = null;
  this.swipeDistX = null;
  this.swipeDistY = null;

  this.SWIPE_THRESHOLD = 100;
  this.SWIPE_RESTRAINT = 100;

  this.debouncedResize = app.utils.debounce(this.onWindowResize.bind(this), app.Constants.RESIZE_DEBOUNCE_THRESHOLD_MS);
};


/**
 * Initialization.
 */
app.Viewport.prototype.init = function() {
  this.attachEvents_();

  this.calculateWidth();
  this.setStyles();

  // center the container on load
  this.setCurrentPosition(this.getBlockPosition());
  this.updateContainerPosition(true);

  // ready to go
  this.blocksContainerElem.css('visibility', 'visible');

  if (Modernizr.touch) {
    this.elem.addClass('no-hover');
  } else {
    this.elem.addClass('hover');
  }
};


/**
 * Clean up
 */
app.Viewport.prototype.destroy = function() {
  this.detachEvents_();
  this.blocksElem = null;
  this.blocksContainerElem = null;
  this.controlsElem = null;
  this.debouncing = null;
};


/**
 * Add event listeners to our interested elements.
 */
app.Viewport.prototype.attachEvents_ = function() {
  $(window).on('resize', this.debouncedResize);

  this.controlsElem.on('click', this.onPaginateClick.bind(this));
  this.controlsElem.on('touchstart', this.onPaginateTouch.bind(this));

  this.elem.on('touchstart', this.onTouchSceneStart.bind(this));
  this.elem.on('touchmove', this.onTouchSceneMove.bind(this));
  this.elem.on('touchend', this.onTouchSceneEnd.bind(this));
};


/**
 * Removes event listeners from our interested elements.
 */
app.Viewport.prototype.detachEvents_ = function() {
  $(window).off('resize', this.debouncedResize);

  this.controlsElem.off('click', this.onPaginateClick);
  this.controlsElem.off('touchstart', this.onPaginateClick);

  this.elem.off('touchstart', this.onTouchSceneStart.bind(this));
  this.elem.off('touchmove', this.onTouchSceneMove.bind(this));
  this.elem.off('touchend', this.onTouchSceneEnd.bind(this));
};


/**
 * Callback for when the user is touching the scene.
 * Try to detect if a swipe is made.
 * @param  {Object} event the event object.
 */
app.Viewport.prototype.onTouchSceneStart = function (event) {
  var touchObj = event.originalEvent.changedTouches[0];

  // new touch, reset values
  this.swipeDist = 0;
  this.touchStartX = touchObj.pageX;
  this.touchStartY = touchObj.pageY;
};


/**
 * Callback for when the user is still touching the scene with a distance.
 * @param {Object} event the event object.
  */
app.Viewport.prototype.onTouchSceneMove = function (event) {
  // don't scroll, we're swiping
  event.preventDefault();
};


/**
 * Callback for when the user is done touching the scene.
 * @param  {object} event the event object.
 */
app.Viewport.prototype.onTouchSceneEnd = function (event) {
  var touchObj = event.originalEvent.changedTouches[0];

  this.swipeDistX = touchObj.pageX - this.touchStartX;
  this.swipeDistY = touchObj.pageY - this.touchStartY;

  // Is the swipe long enough?
  if (Math.abs(this.swipeDistX) >= this.SWIPE_THRESHOLD &&
    Math.abs(this.swipeDistY) <= this.SWIPE_RESTRAINT) {

    if (this.swipeDistX < 0) {
      this.handlePaginate(-1);
    } else {
      this.handlePaginate(1);
    }
  }
};


/**
 * Callback for when the user taps the pagination control.
 * @param  {Object} event the event object.
 */
app.Viewport.prototype.onPaginateTouch = function(event) {
  event.preventDefault(); // don't let the click go through
  this.handlePaginate(parseInt($(event.currentTarget).data('direction'), 10));
};


/**
 * Callback for when we clicked the previous or next button.
 * @param {Object} event the event object.
 */
app.Viewport.prototype.onPaginateClick = function(event) {
  this.handlePaginate(parseInt($(event.currentTarget).data('direction'), 10));
};


/**
 * Callback for when the window is being resized.
 *
 * We need to update our elements width based
 * on the new screen size and update the container
 * accondingly.
 */
app.Viewport.prototype.onWindowResize = function() {
  // Update our elements
  this.calculateWidth();
  this.setStyles();

  // Make sure we are in the correct index again
  this.paginate(true); // true for no transition
};


/**
 * Get's the current viewport width
 * times the factor of how much each block should occupy.
 */
app.Viewport.prototype.calculateWidth = function() {
  // viewport values
  this.viewportWidth = Math.floor(this.viewportElem.outerWidth());
  this.viewportScaledWidth = Math.floor(this.viewportWidth * app.Constants.VIEW_SIZE_FACTOR);

  // container values
  this.blocksContainerWidth = Math.floor(this.viewportScaledWidth * this.numberOfBlocks);
  // the container can't go lower than it's min width or it will look weird
  this.blocksContainerWidth = Math.max(this.blocksContainerWidth, app.Constants.FULL_SCENE_MIN_WIDTH);

  // block values
  this.blockWidth = Math.floor(this.blocksContainerWidth / this.numberOfBlocks);
  // the block can't go lower then it's min width or it will look weird
  this.blockWidth = Math.max(this.blockWidth, app.Constants.MIN_BLOCK_WIDTH);
};


/**
 * Sets the width and left positions
 * of our container and it's child blocks
 */
app.Viewport.prototype.setStyles = function() {
  var i = null;

  // Update the container width
  this.blocksContainerElem
    .css('width', this.blocksContainerWidth);

  // Update the blocks width
  for (i = 0; i < this.numberOfBlocks; i++) {
    this.blocksElem.eq(i).css({
        width: this.blockWidth,
        left: i * this.blockWidth
    });
  }
};


/**
 * Floors and saves the current position of the container
 */
app.Viewport.prototype.setCurrentPosition = function(position) {
  this.currentPosition = Math.floor(position);
};


/**
 * Returns the position of the block with a gap factor
 * so you can see a piece of the previous and next blocks (if any)
 */
app.Viewport.prototype.getBlockPosition = function() {
  var _value = null;

  // Is our container fixed now due to the necessary min width?
  if (this.blocksContainerWidth === app.Constants.FULL_SCENE_MIN_WIDTH) {
    // base it the translate on the viewport width
    // so it's exactly in the middle
    _value = (this.blocksContainerWidth - this.viewportWidth) / 2;
  } else {
    _value = this.blockWidth - (this.blockWidth * app.Constants.VIEW_GAP);
  }

  return _value * -1;
};


/**
 * Positions the container by translating it's value.
 @param {Boolean} forceTransition
 */
app.Viewport.prototype.updateContainerPosition = function(forceTransition) {
  var _this = this;
  var duration = (forceTransition) ? 0 : app.Constants.CONTAINER_TRANSITION_DURATION_MS;

  // Move it
  this.blocksContainerElem.css({
      'transition-duration': duration + 'ms',
      'transform': 'translateX(' + this.currentPosition + 'px)'
  });

  setTimeout(function() {
    _this.isAnimating = false;
  }, app.Constants.CONTAINER_TRANSITION_DURATION_MS);
};


/**
 * Performs a very subtle parallax on the mountain
 * by moving it at the same time as the container is moving.
 * @param  {Boolean} forceTransition are we supposed to have a duration or just update it.
 */
app.Viewport.prototype.moveMountain = function(forceTransition) {
  var currentTranslateValue = this.mountainElem.data('translate') || 0;
  var duration = (forceTransition) ? 0 : app.Constants.CONTAINER_TRANSITION_DURATION_MS;
  var direction = 0;
  var _this = this;
  var from  = {i: 0};
  var to  = {i: this.blockWidth};

  // If it's an instant update
  // no need to parallax the mountain
  if (forceTransition) {
    return;
  }

  if (this.currentDirectionIndex > this.lastDirectionIndex) {
    // going right
    direction = -1;
  } else {
    // going left
    direction = 1;
  }

  $(from).animate(to, {
    duration: duration,
    step: function(step) {
      var translateValue = parseInt(currentTranslateValue, 10);

      if (direction > 0) {
        translateValue += (step / 100);
      } else {
        translateValue -= (step / 100);
      }

      // Move our mountain a little bit
      _this.mountainElem.css({
          'transform': 'translateX(' + translateValue + 'px)'
      }).data('translate', translateValue);
    }

  });
};


/**
 * Move the container to a specific direction index
 * @param {Boolean} forceTransition If we have a duration in the transition.
 */
app.Viewport.prototype.paginate = function(forceTransition) {
  var translateValue = null;

  switch (this.currentDirectionIndex) {
    case -1:
      translateValue = 0;
      this.controlLeftElem.attr('class', app.Constants.CLASS_CONTROL_LEFT_DISABLED );
      break;
    case 0:
      translateValue = this.getBlockPosition();
      this.controlLeftElem.attr('class', app.Constants.CLASS_CONTROL_LEFT_ENABLED);
      this.controlRightElem.attr('class', app.Constants.CLASS_CONTROL_RIGHT_ENABLED);
      break;
    case 1:
      translateValue = (this.blocksContainerWidth - this.viewportWidth) * -1;
      this.controlRightElem.attr('class', app.Constants.CLASS_CONTROL_RIGHT_DISABLED );
      break;
  }

  // Update the container
  this.setCurrentPosition(translateValue);
  this.updateContainerPosition(forceTransition);
  this.moveMountain(forceTransition);
};


/**
 * Normalizes the direction we are going and cache the last one.
 * @param  {Number} directionIndex the direction clicked/touched/swiped. Can be -1 or +1.
 */
app.Viewport.prototype.handlePaginate = function(directionIndex) {
  // Let the previous animation finish first
  if (this.isAnimating) {
    return;
  }

  // Flag that we are busy now
  this.isAnimating = true;

  this.lastDirectionIndex = this.currentDirectionIndex;
  this.currentDirectionIndex -= directionIndex;
  // Can't be lower than -1
  this.currentDirectionIndex = Math.max(this.currentDirectionIndex, -1);
  // Can't be higher than 1
  this.currentDirectionIndex = Math.min(this.currentDirectionIndex, 1);

  // Do we need to move at all?
  if (this.lastDirectionIndex !== this.currentDirectionIndex) {
    this.paginate();
  } else {
    this.isAnimating = false;
  }
};
