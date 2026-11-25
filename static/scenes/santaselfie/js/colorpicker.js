/*
 * Copyright 2026 Google Inc. All rights reserved.
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

goog.provide('app.ColorPicker');



/**
 * Popup where any colour can be picked with one press. Hue runs left to right, light to dark
 * runs top to bottom, and a strip on the left holds the greys.
 * @param {!jQuery} $elem toolbox elem
 * @param {function(string): void} onPick called with the picked colour as rrggbb
 * @constructor
 */
app.ColorPicker = function($elem, onPick) {
  this.el = $elem.find('.ColorPicker');
  this.field = this.el.find('.ColorPicker-field');
  this.marker = this.el.find('.ColorPicker-marker');
  this.isOpen = false;

  this.drawField_();

  // mouse.js cancels touchstart, so a tap never becomes a click: listen for touchend as well.
  this.el.on('click touchend', (e) => {
    e.preventDefault();
    // A press in the popup must not reach the toolbox, which would put the spray back.
    e.stopPropagation();

    const point = e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0] : e.originalEvent;
    const rect = this.field[0].getBoundingClientRect();
    const fx = (point.clientX - rect.left) / rect.width;
    const fy = (point.clientY - rect.top) / rect.height;

    if (fx >= 0 && fx < 1 && fy >= 0 && fy <= 1) {
      this.marker.css({left: fx * 100 + '%', top: fy * 100 + '%'}).addClass('is-visible');
      onPick(app.ColorPicker.colorAt(fx, fy));
    }
  });
};


/** @const {number} Share of the field width taken by the grey strip. */
app.ColorPicker.GREY_WIDTH = 0.1;

/** @const {number} Lightness at the top edge of the field (1 is white). */
app.ColorPicker.LIGHTEST = 0.92;

/** @const {number} Lightness at the bottom edge of the field (0 is black). */
app.ColorPicker.DARKEST = 0.12;


/**
 * @param {number} fx horizontal position in the field, 0 to 1
 * @param {number} fy vertical position in the field, 0 to 1
 * @return {string} the colour there, as rrggbb
 */
app.ColorPicker.colorAt = function(fx, fy) {
  var channels;

  if (fx < app.ColorPicker.GREY_WIDTH) {
    channels = [1 - fy, 1 - fy, 1 - fy];
  } else {
    var lightness = app.ColorPicker.LIGHTEST - fy * (app.ColorPicker.LIGHTEST - app.ColorPicker.DARKEST);
    var sector = (fx - app.ColorPicker.GREY_WIDTH) / (1 - app.ColorPicker.GREY_WIDTH) * 6;

    // The fully saturated hue, then mixed towards white or black.
    channels = [0, 4, 2].map(function(offset) {
      var pure = Math.min(1, Math.max(0, Math.abs((sector + offset) % 6 - 3) - 1));
      return lightness >= 0.5 ? pure + (1 - pure) * (2 * lightness - 1) : pure * 2 * lightness;
    });
  }

  return channels.map(function(channel) {
    return ('0' + Math.round(channel * 255).toString(16)).slice(-2);
  }).join('');
};


/**
 * Paints the field, column by column, with the same colours colorAt returns.
 * @private
 */
app.ColorPicker.prototype.drawField_ = function() {
  var canvas = this.field[0];
  var ctx = canvas.getContext('2d');
  // Where a column passes through its pure hue; the mix is linear on either side of it.
  var pureAt = (app.ColorPicker.LIGHTEST - 0.5) / (app.ColorPicker.LIGHTEST - app.ColorPicker.DARKEST);

  for (var x = 0; x < canvas.width; x++) {
    var fx = (x + 0.5) / canvas.width;
    var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#' + app.ColorPicker.colorAt(fx, 0));
    gradient.addColorStop(pureAt, '#' + app.ColorPicker.colorAt(fx, pureAt));
    gradient.addColorStop(1, '#' + app.ColorPicker.colorAt(fx, 1));

    ctx.fillStyle = gradient;
    ctx.fillRect(x, 0, 1, canvas.height);
  }
};


app.ColorPicker.prototype.open = function() {
  this.isOpen = true;
  this.el.addClass('is-open');
};


app.ColorPicker.prototype.close = function() {
  this.isOpen = false;
  this.el.removeClass('is-open');
};
