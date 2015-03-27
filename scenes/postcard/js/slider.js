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

goog.provide('app.Slider');

/**
 * Slides the background and the foreground.
 * @param {!Element} elem The slider element.
 * @param {{track: Element, changed: function,
 *     max: number, width: number, size: number,
 *     horizontal: bool}} options
 * @constructor
 */
app.Slider = function(elem, options) {
  this.elem = $(elem);
  this.changed = options.changed;
  this.max = options.max;
  this.size = options.size;
  this.horizontal = options.horizontal;

  // Keep track of children ordering in an array
  this.children = [].slice.call(this.elem.children());
  this.children = this.children.map(function(x) { return $(x); });

  // Keep track of what fg and bg is selected
  this.center = Math.ceil(this.max / 2) - 1;
  this.selected = 1;
  this.position = 0;
  this.first = 0;
  this.totalSize = this.size * this.max;

  // Set element to initial position
  this.balance_(-this.center);
};

/**
 * Calculates position after adding/substracting a number.
 * @param {number} change This number gets added to the selected position.
 * @return {number} The position.
 */
app.Slider.prototype.getPosition = function(change) {
  var number = this.selected + change;

  // Check boundaries
  if (number < 1) {
    return this.max + number;
  } else if (number > this.max) {
    return number - this.max;
  }

  return number;
};

/**
 * Set positions to trigger animations.
 * @param {number} change How many slides to animate, negative numbers go left.
 * @private
 */
app.Slider.prototype.update_ = function(change) {
  var axis = this.horizontal ? 'X' : 'Y';

  this.elem.css('transform', 'translate' + axis + '(' + (this.position * this.size * -1) + 'px)');
  this.changed(this.selected, this.position, change);
};

/**
 * Balance children to allow endless looping
 * @param {number} change How many slides to animate, negative numbers go left.
 * @private
 */
app.Slider.prototype.balance_ = function(change) {
  var elems, alignment = this.horizontal ? 'left' : 'top';

  // Move elements to the back
  if (change > 0) {
    elems = this.children.splice(0, change);

    for (var i = 0, elem; elem = elems[i]; i++) {
      elem.css(alignment, '+=' + this.totalSize + 'px');
    }

    this.children.push.apply(this.children, elems);
  // Move elements to the front
  } else {
    elems = this.children.splice(change);

    for (var i = 0, elem; elem = elems[i]; i++) {
      elem.css(alignment, '-=' + this.totalSize + 'px');
    }

    this.children.unshift.apply(this.children, elems);
  }

  // Set new start position
  this.first += change * this.size;
};

/**
 * Slide slider by a given change
 * @param {number} change How many slides to animate, negative numbers go left.
 */
app.Slider.prototype.slide = function(change) {
  this.selected = this.getPosition(change);
  this.position += change;

  this.update_(change);
};

/**
 * Update the UI.
 * @param {number} change How many slides to animate, negative numbers go left.
 */
app.Slider.prototype.draw = function(change) {
  // Balance slides before animating
  this.balance_(change);

  // Animate
  this.slide(change);
};

/**
 * Animate to another position.
 * @param {number} number The new position.
 */
app.Slider.prototype.set = function(number) {
  // Check if we need to change
  if (this.selected === number) {
    return;
  }

  // Find out how the distance between slides
  var difference = number - this.selected;

  // Find out what direction we are going to
  var change = difference;

  // Animate as short distance as possible
  if (Math.abs(change) > this.center) {
    if (change > 0) {
      change = this.max - change;
      change = change * -1;
    } else {
      change = this.max + change;
    }
  }

  this.draw(change);
};
