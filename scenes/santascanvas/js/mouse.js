/*
 * Copyright 2017 Google Inc. All rights reserved.
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

  this.subscribers = [];

  $(window).on('resize.santascanvas orientationchange.santascanvas', function() {
    this.update();
  }.bind(this));

  $elem.on('mousemove.santascanvas', function(e) {
    this.x = e.clientX;
    this.y = e.clientY;
    this.target = e.target;

    e.preventDefault();
  }.bind(this));

  $elem.on('touchstart.santascanvas touchmove.santascanvas', function(e) {
    this.x = e.originalEvent.touches[0].clientX;
    this.y = e.originalEvent.touches[0].clientY;
    this.target = e.originalEvent.touches[0].target;

    e.preventDefault();
  }.bind(this));

  $elem.on('mousedown.santascanvas touchstart.santascanvas', function(e) {
    this.down = true;

    if (e.type == 'touchstart') {
      this.originalTarget = e.originalEvent.touches[0].target;
    } else {
      this.originalTarget = e.target;
    }

    e.preventDefault();
  }.bind(this));

  $elem.on('mouseup.santascanvas mouseleave.santascanvas touchend.santascanvas touchleave.santascanvas', function(e) {
    this.down = false;
    this.originalTarget = null;

    if (e.cancelable) {
      e.preventDefault();
    }
  }.bind(this));
};


/**
 * Subscribe to mouse and touch events
 * @param {function(!app.Mouse, app.Mouse.CoordsType)} callback The callback to be called
 * @param {*} context The value of this passed to the callback
 **/
app.Mouse.prototype.subscribe = function(callback, context) {
  this.subscribers.push({
    callback: callback,
    context: context
  });
};


/**
 * Notify subscribers of mouse updates.
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
 * @return {app.Mouse.CoordsType} transformed coordinates
 **/
app.Mouse.prototype.transformCoordinates = function(x, y, rect) {
  var relX = x - rect.left;
  var relY = y - rect.top;
  return {
    x: relX,
    y: relY,
    normX: relX / rect.width,
    normY: relY / rect.height,
    down: this.down
  };
};


/**
 * @param {number} x The x coordinate
 * @param {number} y The y coordinate
 * @param {!Element} element The element to check
 * @return {boolean} true if coordinates are inside rect
 **/
app.Mouse.prototype.isInsideEl = function(x, y, element) {
  var rect = element.getBoundingClientRect();
  var coords = this.transformCoordinates(x, y, rect);
  return coords.normX >= 0 && coords.normX <= 1 && coords.normY >= 0 &&
      coords.normY <= 1;
};

/**
 * @typedef {{x: number, y: number, down: boolean}}
 */
app.Mouse.CoordsType;

