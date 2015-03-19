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

goog.provide('app.Mouse');



/**
 * Global game mouse. Listens to mouse events on provided element
 * @param {!jQuery} $elem The element
 * @constructor
 */
app.Mouse = function($elem) {
  this.$elem = $elem;
  this.elem = $elem[0];
  this.rect = this.elem.getBoundingClientRect();
  this.down = false;
  this.x = 0;
  this.y = 0;
  this.relX = 0;
  this.relY = 0;

  this.subscribers = [];

  $(window).on('resize.santaselfie orientationchange.santaselfie', function() {
    this.calculateScale_();
    this.update();
  }.bind(this));

  this.calculateScale_();

  $elem.on('mousemove', function(e) {
    this.x = e.clientX;
    this.y = e.clientY;

    e.preventDefault();
  }.bind(this));

  $elem.on('touchstart touchmove', function(e) {
    this.x = e.originalEvent.touches[0].clientX;
    this.y = e.originalEvent.touches[0].clientY;

    e.preventDefault();
  }.bind(this));

  $elem.on('mousedown touchstart', function(e) {
    this.down = true;

    e.preventDefault();
  }.bind(this));

  $elem.on('mouseup mouseleave touchend touchleave', function(e) {
    this.down = false;

    if (e.cancelable) {
      e.preventDefault();
    }
  }.bind(this));
};


/**
 * Calculate scale based on the window's width and height. Called on resize.
 * @private
 */
app.Mouse.prototype.calculateScale_ = function() {
  var originalWidth = 1920;
  var originalHeight = 985;

  // The game should get bigger as the width decreases.
  var widthReductionFactor = 1420;

  var width = $(window).width();
  var height = $(window).height();

  var scaleWidth = (width + widthReductionFactor) / (originalWidth + widthReductionFactor);
  var scaleHeight = height / originalHeight;
  var scaleFactor = Math.min(scaleWidth, scaleHeight);

  this.$elem.css({
    'font-size': scaleFactor
  });

  this.rect = this.elem.getBoundingClientRect();
  this.scaleFactor = scaleFactor;
};


/**
 * Subscribe to mouse and touch events
 * @param {function} callback The callback to be called
 * @param {object} context The value of this passed to the callback
 **/
app.Mouse.prototype.subscribe = function(callback, context) {
  this.subscribers.push({
    callback: callback,
    context: context
  });
};


/**
 * Notify subscribers of mouse updates. Called on animation frame.
 **/
app.Mouse.prototype.update = function() {
  var coordinates = this.coordinates();

  this.subscribers.forEach(function(subscriber) {
    subscriber.callback.call(subscriber.context, this, coordinates);
  }, this);
};


/**
 * Retrieves the transformed coordinates for this mouse.
 * @return {!app.Mouse.CoordsType} transformed coordinates
 */
app.Mouse.prototype.coordinates = function() {
  return this.transformCoordinates(this.x, this.y, this.rect);
};


/**
 * Transform coordinates relative to a client rect.
 * @param {number} x The x coordinate
 * @param {number} y The y coordinate
 * @param {!ClientRect} rect A client rect to transform the coordinates relative to
 * @return {!app.Mouse.CoordsType} transformed coordinates
 **/
app.Mouse.prototype.transformCoordinates = function(x, y, rect) {
  return {
    x: x - rect.left,
    y: y - rect.top,
    relX: 2 * x / rect.width - 1,
    relY: 2 * y / rect.height - 1,
    down: this.down,
    scale: this.scaleFactor
  };
};


/**
 * @typedef {{x: number, y: number, relX: number, relY: number, down: boolean, scale: number}}
 */
app.Mouse.CoordsType;

