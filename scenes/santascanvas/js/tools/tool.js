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

goog.provide('app.Tool');
goog.require('app.shared.utils');
goog.require('app.utils');


/**
 * Base tool item
 * @constructor
 * @param {!jQuery} $elem toolbox elem
 * @param {string} name The name of the tool.
 * Element should have class Tool-name.
 */
app.Tool = function($elem, name) {
  this.elem = $elem;
  this.el = this.elem.find('[data-tool="' + name + '"]');
  this.hoverEl = this.elem.find('[data-tool-hover]');
  this.circleEl = this.elem.find('[data-tool-hover-circle]');
  this.name = name;
  this.category = this.el.closest('[data-tool-category]')
    .attr('data-tool-category');
  this.isSelected = false;
  // TODO: calculate this based on circle size
  this.mouseOffset = {x: -10, y: 10};
  this.soundKey = '';
  this.disableResize = false;
  this.disableColorpicker = false;
};


/**
 * Select this tool from the toolbox
 * @param {!app.Mouse.CoordsType} mouseCoords at selection time
 */
app.Tool.prototype.select = function(mouseCoords) {
  this.isSelected = true;

  this.el.addClass('Tool--selected');

  this.hoverEl.addClass('is-selected');
  this.hoverEl.attr('data-tool-hover-category', this.category);
  this.hoverEl.attr('data-tool-hover-tool', this.name);

  // Hide tool on touch devices
  if (app.shared.utils.touchEnabled) {
    this.hoverEl.css({
      display: 'none'
    });
  }

  this.move(mouseCoords);

  if (this.category === "spray") {
    window.santaApp.fire('sound-trigger', 'sfx_select_lid_open');
  }else if (this.category === "stamp") {
    window.santaApp.fire('sound-trigger', 'cd_stamp_up');
  }else {
    window.santaApp.fire('sound-trigger', 'cd_generic_select');
  }
};


/**
 * Deselect this tool
 */
app.Tool.prototype.deselect = function() {
  this.isSelected = false;

  this.el.removeClass('Tool--selected');
  this.hoverEl.removeClass('is-selected');
  this.hoverEl.css({
    top: '',
    left: ''
  });
  this.elem.css({
    cursor: ''
  });
  if (this.hoverPreviewEl) {
    this.hoverPreviewEl.css({
      transform: 'translate(-50%, -50%)'
    });
  }
  this.currentAngle = 0;

  this.hoverEl.attr('data-tool-hover-category', '');
  this.hoverEl.attr('data-tool-hover-tool', '');

  this.stopMousedown();
  this.reset();

  if (this.category === "spray") {
    window.santaApp.fire('sound-trigger', 'sfx_unselect_lid_close');
  }else {
    window.santaApp.fire('sound-trigger', 'cd_generic_deselect');
  }
};


/**
 * Move the tool to the specified mouse position
 * @param {!app.Mouse.CoordsType} mouseCoords transformed coords
 */
app.Tool.prototype.move = function(mouseCoords) {
  if (!app.shared.utils.touchEnabled) {
    this.hoverEl.css({
      left: mouseCoords.x + (this.mouseOffset.x),
      top: mouseCoords.y + (this.mouseOffset.y) + window.santaApp.headerSize,
    });
  }
};


/**
 * Reset on mouse up
 */
app.Tool.prototype.reset = function() {
  return null;
}


/**
 * Draws to the canvas using this tool
 * @param  {!HTMLCanvasElement} canvas The canvas to draw to
 * @param  {!app.Canvas.CoordsType} mouseCoords Mouse coords
 * @param  {!HTMLCanvasElement} prevCanvas  The previously saved canvas
 * @param  {!number} size  The current size setting
 * @param  {!string} color  The current color setting
 * @return {boolean} Whether the canvas was changed
 */
app.Tool.prototype.draw = function(canvas, mouseCoords, prevCanvas, size, color) {
  return false;
}


/**
 * Mousedown handler
 */
app.Tool.prototype.startMousedown = function() {
  app.utils.triggerStart(this.soundKey);
  this.hoverEl.addClass('is-down');
}


/**
 * Mouseup handler
 */
app.Tool.prototype.stopMousedown = function() {
  app.utils.triggerStop(this.soundKey);
  this.hoverEl.removeClass('is-down');
}


/**
 * Updates size indicator
 * @param  {!number} size  The current size setting
 */
app.Tool.prototype.updateSize = function(size) {
  this.currentSize = this.calculateDrawSize(size);
}


app.Tool.prototype.calculateDrawSize = function(size) {
  return size * 100;
}


app.Tool.prototype.updateAngle = function(angle) {
  return;
};


app.Tool.prototype.preloadImage = function(color) {
  return;
};
