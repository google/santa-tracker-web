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
goog.require('app.MobileSlider');
goog.require('goog.ui.Slider');

/**
 * Custom Slider for stroke size in the tools
 * @param {!Element} elem The DOM element which wraps the slider.
 * @constructor
 */
app.CustomSlider = function(elem) {
  // Hacky, but prevents slider from being totally broken.
  goog.global.setTimeout = window.setTimeout.bind(window);

  this.sizeSliderThumb = elem.find('#Slider-thumb--scale')[0];
  this.sizeMobile = new app.MobileSlider(elem.find('.crayon-size-wrapper'));
  this.strokeSize = 6;
  this.sizeSlider = new goog.ui.Slider();
  this.sizeSlider.setHandleMouseWheel(false);
  this.sizeSlider.setMoveToPointEnabled(true);
  this.sizeSlider.setMinimum(1);
  this.sizeSlider.setMaximum(4);
  this.sizeSlider.setStep(1);
  this.sizeSlider.decorate(elem.find('#Slider')[0]);
  this.sizeSlider.addEventListener('touchmove', function(event) {
    event.preventDefault();
  });
  this.addEventListeners();
  this.sizeSlider.setValue(4);
  app.GameManager.sizeSlider = this;
};

/**
 * Add Custom Slider listeners
 */
app.CustomSlider.prototype.addEventListeners = function() {
  var changeEvent = goog.ui.Component.EventType.CHANGE;
  this.sizeSlider.addEventListener(changeEvent, this.sliderChange.bind(this), false);
};

/**
 * Slider handler
 * @param {Event} event
 */
app.CustomSlider.prototype.sliderChange = function(event) {
  this.updateValueTo(this.sizeSlider.getValue());
  if (app.GameManager.mobileSlider) {
    app.GameManager.mobileSlider.changeActiveSize(this.sizeSlider.getValue(),
        this.sizeSlider.getMaximum());
  }
  Klang.triggerEvent('spirit_sizeselect');
};

/**
 * Update slide value
 * @param {number} value stroke value
 */
app.CustomSlider.prototype.updateValueTo = function(value) {
  var max = this.sizeSlider.getMaximum();
  var min = this.sizeSlider.getMinimum();
  var buffer = .04 * (((max - value) * value) / min);
  var scale = 'scale(' + ((value / max) + buffer) + ')';

  this.sizeSliderThumb.style.webkitTransform = scale;
  this.sizeSliderThumb.style.msTransform = scale;
  this.sizeSliderThumb.style.transform = scale;
  if (app.GameManager.tool) {
    app.GameManager.tool.bounceTo((value * .1) * 2 + .2);
  }

  this.strokeSize = value * 10;
};
