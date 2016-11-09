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

goog.provide('app.CustomSlider');

goog.require('app.GameManager');

/**
 * Custom Slider for stroke size in the tools
 * @param {!Element|jQuery} elem The DOM element which wraps the slider.
 * @constructor
 */
app.CustomSlider = function(elem) {
  elem = $(elem);
  this.sizeSliderThumb = elem.find('#Slider-thumb--scale')[0];
  this.crazyonSizeWrapper = elem.find('.crayon-size-wrapper');
  this.strokeSize = 0;
  this.currentValue = -1;
  this.minValue = 1;
  this.maxValue = 4;

  this.mobileSizeContainer = elem.find('.crayon-size-container');
  this.mobileSizeContainer.children().each((id, el) => {
    const size = +el.dataset['size'];
    $(el).on('touchstart mousedown', event => {
      this.updateValueTo(size);
      this.toggleMobile();
    });
  });

  this.mobileSizeTool = elem.find('.crayon-size-indicator-container');
  this.mobileSizeTool.on('touchstart mousedown', this.toggleMobile.bind(this));

  const el = elem.find('#Slider');
  el.on('touchmove mousemove touchdown mousedown', function(ev) {
    const valid = (ev.originalEvent.touches && ev.originalEvent.touches.length > 0) || ev.which;
    if (!valid) { return; }

    const offset = el.offset();
    const leftPosition = ev.pageX - el.offset().left;
    const width = el.width();
    const selected = Math.round(0.5 + leftPosition / width * 4);

    this.updateValueTo(selected);
  }.bind(this));

  this.updateValueTo(4);
};

/**
 * Toggle the mobile slider.
 * @param {boolean=} opt_force to force on/off
 */
app.CustomSlider.prototype.toggleMobile = function(opt_force) {
  this.mobileSizeContainer.toggleClass('open', opt_force);
}

/**
 * Update slide value
 * @param {number} value stroke value
 */
app.CustomSlider.prototype.updateValueTo = function(value) {
  const max = this.maxValue;
  const min = this.minValue;
  value = Math.max(min, Math.min(max, value));

  if (this.currentValue == value) {
    return;
  }
  this.currentValue = value;
  window.santaApp.fire('sound-trigger', 'spirit_sizeselect');

  const left = (value - 1) / 3 * (179 - 20);  // minus 20px for thing itself
  const buffer = .04 * (((max - value) * value) / min);
  const transform = 'translate(' + left + 'px) scale(' + ((value / max) + buffer) + ')';

  this.sizeSliderThumb.style.transform = transform;
  if (app.GameManager.tool) {
    app.GameManager.tool.bounceTo((value * .1) * 2 + .2);
  }

  this.strokeSize = value * 10;

  this.crazyonSizeWrapper.find('.active').removeClass('active');
  this.crazyonSizeWrapper.find('[data-size="' + value + '"]').addClass('active');
  this.crazyonSizeWrapper.find('[data-size="' + value + '"] > div').addClass('active');
};
