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

goog.provide('app.Slider');
goog.require('app.Constants');


app.Slider = function($elem, mouse) {
  this.elem = $elem;
  this.base = this.elem.find('[data-slider-base]');
  this.dot = this.elem.find('[data-slider-dot]');
  this.sliding = false;
  this.mouse = mouse;
  this.setSize(0.5);
};



app.Slider.prototype.mouseChanged = function(mouse) {
  if (!this.sliding) {
    var bounds = this.checkBounds(mouse);
    if (mouse.down && bounds.inX && bounds.inY) {
      this.sliding = true;
      this.setSize(bounds.coords.normX, bounds.coords.x);
    }
  } else {
    if (!mouse.down) {
      this.sliding = false;
      return;
    }

    var bounds = this.checkBounds(mouse);
    if (bounds.inX) {
      this.setSize(bounds.coords.normX, bounds.coords.x);
    }
  }
};


app.Slider.prototype.checkBounds = function(mouse) {
  var rect = this.base[0].getBoundingClientRect();
  var baseCoords = this.mouse.transformCoordinates(mouse.x, mouse.y, rect);
  var horizontal = false;
  var vertical = false;
  if (baseCoords.normX >= 0 && baseCoords.normX <= 1) {
    horizontal = true;
  }

  if (baseCoords.normY >= 0 && baseCoords.normY <= 1) {
    vertical = true;
  }

  return {
    coords: baseCoords,
    inX: horizontal,
    inY: vertical
  };
};


app.Slider.prototype.setSize = function(relativeSize, xPos) {
  var dotOffset = xPos;
  if (!xPos) {
    var rect = this.base[0].getBoundingClientRect();
    dotOffset = rect.width * relativeSize;
  }

  this.dot.css('left', dotOffset);
  this.dot.css('transform',
      'scale(' + (1 + relativeSize * 1) + ') translate(-50%, -50%)');
  // this.size = (app.Constants.MAX_TOOL_SIZE - app.Constants.MIN_TOOL_SIZE) *
  //     relativeSize + app.Constants.MIN_TOOL_SIZE;
  this.size = relativeSize;
};
