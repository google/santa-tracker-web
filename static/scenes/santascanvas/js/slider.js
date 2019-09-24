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


/**
 * @constructor
 */
app.Slider = function($elem, mouse) {
  this.elem = $elem;
  this.container = this.elem.find('[data-slider]');
  this.base = this.elem.find('[data-slider-base]');
  this.dot = this.elem.find('[data-slider-dot]');
  this.sliding = false;
  this.mouse = mouse;
  this.subscribers = [];

  this.container.on('mousedown.santascanvas touchstart.santascanvas',
    this.onMousedown.bind(this));

  this.onResize();
  $(window).on('resize.santascanvas', this.onResize.bind(this));

  this.setSize(0.5);
};


app.Slider.prototype.mouseChanged = function(mouse) {
  if (this.sliding) {
    if (!mouse.down) {
      this.sliding = false;
      return;
    }

    var bounds = this.checkBounds(mouse);
    if (this.isMobile) {
      if (bounds && bounds.inY) {
        this.setSize((1 - bounds.coords.normY), bounds.coords.y, true);
      }
    } else {
      if (bounds && bounds.inX) {
        this.setSize(bounds.coords.normX, bounds.coords.x);
      }
    }
  }
};


app.Slider.prototype.onMousedown = function() {
  if (this.disabled) {
    window.santaApp.fire('sound-trigger', 'cd_fail');
    return;
  }

  this.sliding = true;
};


app.Slider.prototype.checkBounds = function(mouse) {
  // var rect = this.base[0].getBoundingClientRect();
  var slider = mouse.target.closest('[data-slider]');
  var base = $(slider).find('[data-slider-base]')[0];
  if (base) {
    var rect = base.getBoundingClientRect();
  } else {
    return null;
  }

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


app.Slider.prototype.setSize = function(relativeSize, xPos, vertical) {
  var dotOffset = xPos;
  var rect;
  if (!xPos) {
    if (this.isMobile) {
      rect = this.base[this.base.length - 1].getBoundingClientRect(); // mobile slider
      dotOffset = rect.height * relativeSize;
    } else {
      rect = this.base[0].getBoundingClientRect();
      dotOffset = rect.width * relativeSize;
    }
  }

  if (vertical) {
    this.dot.css('left', '');
    this.dot.css('right', dotOffset);
    this.dot.css('transform',
        'translate(50%, -50%) scale(' + (1 + relativeSize * 1) + ')');
  } else {
    this.dot.css('left', dotOffset);
    this.dot.css('transform',
        'translate(-50%, -50%) scale(' + (1 + relativeSize * 1) + ')');
  }
  this.size = relativeSize;

  this.subscribers.forEach(function(subscriber) {
    subscriber.callback.call(subscriber.context, this.size);
  }, this);
};


app.Slider.prototype.subscribe = function(callback, context) {
  this.subscribers.push({
    callback: callback,
    context: context
  });
};


app.Slider.prototype.onResize = function() {
  if (this.elem[0].getBoundingClientRect().width <= app.Constants.MOBILE_BREAKPOINT) {
    this.isMobile = true;
  } else {
    this.isMobile = false;
  }
};


app.Slider.prototype.setDisabled = function(isDisabled) {
  this.container.attr('data-slider-disabled', isDisabled);
  this.disabled = isDisabled;
};

