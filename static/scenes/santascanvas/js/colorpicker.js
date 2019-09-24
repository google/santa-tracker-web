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

goog.provide('app.Colorpicker');
goog.require('app.Constants');


/**
 * @constructor
 */
app.Colorpicker = function($elem) {
  this.elem = $elem;
  this.container = this.elem.find('[data-colorpicker]');
  this.selector = this.elem.find('[data-colorpicker-selector]');
  this.popup = this.elem.find('[data-colorpicker-popup]');
  this.colors = this.elem.find('[data-colorpicker-color]');
  this.tools = this.elem.find('[data-tool-color]');
  this.subscribers = [];
  this.setColor('#' + app.Constants.COLORPICKER_DEFAULT);

  this.colors.each(function() {
    var el = $(this);
    var color = el.attr('data-colorpicker-color');
    el.css('background', color);
  });

  this.selector.on('click.santascanvas touchend.santascanvas', this.togglePopup.bind(this));
  this.colors.on('click.santascanvas touchend.santascanvas', this.onColorClick.bind(this));
  this.selector.on('mouseenter.santascanvas', this.onColorPickerOver.bind(this));
  this.colors.on('mouseenter.santascanvas', this.onColorOver.bind(this));
};


app.Colorpicker.prototype.togglePopup = function() {
  if (this.disabled) {
    window.santaApp.fire('sound-trigger', 'cd_fail');
    return;
  }

  this.popup.toggleClass('is-visible');
  if (this.isPopupOpen()) {
    window.santaApp.fire('sound-trigger', 'cd_color_popup');
  }
};


app.Colorpicker.prototype.onColorClick = function(event) {
  var color = $(event.target).closest('[data-colorpicker-color]')
      .attr('data-colorpicker-color');
  this.setColor(color);
  this.togglePopup();
  window.santaApp.fire('sound-trigger', 'cd_color_select');
};

app.Colorpicker.prototype.onColorOver = function(event) {
  window.santaApp.fire('sound-trigger', 'cd_color_over');
};

app.Colorpicker.prototype.onColorPickerOver = function(event) {
  window.santaApp.fire('sound-trigger', 'generic_button_over');
};

app.Colorpicker.prototype.setColor = function(color) {
  this.selectedColor = color;
  this.colors.removeClass('is-selected');
  this.elem.find('[data-colorpicker-color="' + color + '"]').addClass('is-selected');
  this.selector.css({
    'background-color': color
  });
  this.tools.attr('data-tool-color', color);

  this.subscribers.forEach(function(subscriber) {
    subscriber.callback.call(subscriber.context, this.selectedColor);
  }, this);
};


app.Colorpicker.prototype.isPopupOpen = function() {
  return this.popup.hasClass('is-visible');
};


app.Colorpicker.prototype.subscribe = function(callback, context) {
  this.subscribers.push({
    callback: callback,
    context: context
  });
};


app.Colorpicker.prototype.setDisabled = function(isDisabled) {
  this.container.attr('data-colorpicker-disabled', isDisabled);
  this.disabled = isDisabled;
  if (isDisabled) {
    this.popup.removeClass('is-visible');
  }
};

